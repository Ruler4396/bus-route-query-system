#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${HOST_GUARD_RUNTIME_DIR:-$ROOT_DIR/runtime/host-guardian}"
STATE_FILE="$RUNTIME_DIR/state.env"
LOG_FILE="$RUNTIME_DIR/guardian.log"
LOCK_FILE="$RUNTIME_DIR/guardian.lock"

BUS_ROUTE_SERVICE="${HOST_GUARD_BUS_ROUTE_SERVICE:-bus-route.service}"
NGINX_SERVICE="${HOST_GUARD_NGINX_SERVICE:-nginx.service}"
SSH_SOCKET_UNIT="${HOST_GUARD_SSH_SOCKET_UNIT:-ssh.socket}"
SSH_SERVICE_UNIT="${HOST_GUARD_SSH_SERVICE_UNIT:-ssh.service}"
NETWORK_STACK_UNIT="${HOST_GUARD_NETWORK_STACK_UNIT:-systemd-networkd.service}"
NETWORK_WAIT_UNIT="${HOST_GUARD_NETWORK_WAIT_UNIT:-systemd-networkd-wait-online.service}"

LOCAL_URL="${HOST_GUARD_LOCAL_URL:-http://127.0.0.1:8133/springbootmf383/front/index.html}"
PUBLIC_URL="${HOST_GUARD_PUBLIC_URL:-http://8.134.206.52:8133/springbootmf383/front/index.html}"
METADATA_URL="${HOST_GUARD_METADATA_URL:-http://100.100.100.200/latest/meta-data/instance-id}"

APP_FAIL_THRESHOLD="${HOST_GUARD_APP_FAIL_THRESHOLD:-2}"
SSH_FAIL_THRESHOLD="${HOST_GUARD_SSH_FAIL_THRESHOLD:-2}"
PUBLIC_FAIL_THRESHOLD="${HOST_GUARD_PUBLIC_FAIL_THRESHOLD:-3}"
REBOOT_FAIL_THRESHOLD="${HOST_GUARD_REBOOT_FAIL_THRESHOLD:-6}"
APP_ACTION_COOLDOWN_SEC="${HOST_GUARD_APP_ACTION_COOLDOWN_SEC:-300}"
SSH_ACTION_COOLDOWN_SEC="${HOST_GUARD_SSH_ACTION_COOLDOWN_SEC:-300}"
NETWORK_ACTION_COOLDOWN_SEC="${HOST_GUARD_NETWORK_ACTION_COOLDOWN_SEC:-600}"
REBOOT_COOLDOWN_SEC="${HOST_GUARD_REBOOT_COOLDOWN_SEC:-21600}"
MAX_REBOOTS_PER_DAY="${HOST_GUARD_MAX_REBOOTS_PER_DAY:-2}"
AUTO_REBOOT_ON_HOST_FAILURE="${HOST_GUARD_AUTO_REBOOT_ON_HOST_FAILURE:-1}"
CURL_TIMEOUT="${HOST_GUARD_CURL_TIMEOUT:-5}"

mkdir -p "$RUNTIME_DIR"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  exit 0
fi

log() {
  printf '[%s] %s\n' "$(date '+%F %T %Z')" "$*" | tee -a "$LOG_FILE"
}

load_state() {
  app_failures=0
  ssh_failures=0
  public_failures=0
  combined_failures=0
  last_app_action_epoch=0
  last_ssh_action_epoch=0
  last_network_action_epoch=0
  last_reboot_epoch=0
  reboot_day="$(date +%F)"
  reboot_count_day=0
  if [[ -f "$STATE_FILE" ]]; then
    # shellcheck disable=SC1090
    source "$STATE_FILE"
  fi
  current_day="$(date +%F)"
  if [[ "${reboot_day:-}" != "$current_day" ]]; then
    reboot_day="$current_day"
    reboot_count_day=0
  fi
}

save_state() {
  cat > "$STATE_FILE.tmp" <<STATE
app_failures=$app_failures
ssh_failures=$ssh_failures
public_failures=$public_failures
combined_failures=$combined_failures
last_app_action_epoch=$last_app_action_epoch
last_ssh_action_epoch=$last_ssh_action_epoch
last_network_action_epoch=$last_network_action_epoch
last_reboot_epoch=$last_reboot_epoch
reboot_day=$reboot_day
reboot_count_day=$reboot_count_day
STATE
  mv "$STATE_FILE.tmp" "$STATE_FILE"
}

cooldown_ready() {
  local last_epoch="$1"
  local cooldown="$2"
  local now_epoch="$3"
  (( now_epoch - last_epoch >= cooldown ))
}

check_systemd_active() {
  local unit="$1"
  systemctl is-active --quiet "$unit"
}

check_local_http() {
  curl -fsS -m "$CURL_TIMEOUT" "$LOCAL_URL" >/dev/null 2>&1
}

check_public_http() {
  curl -fsS -m "$CURL_TIMEOUT" "$PUBLIC_URL" >/dev/null 2>&1
}

check_metadata() {
  curl -fsS -m 3 "$METADATA_URL" >/dev/null 2>&1
}

check_default_route() {
  ip route show default | grep -q .
}

check_ssh_local() {
  if ! (check_systemd_active "$SSH_SOCKET_UNIT" || check_systemd_active "$SSH_SERVICE_UNIT"); then
    return 1
  fi
  ss -ltn | grep -q ':22 '
}

restart_app_stack() {
  log "action=restart_app_stack service=$BUS_ROUTE_SERVICE nginx=$NGINX_SERVICE"
  timeout 30 systemctl restart "$BUS_ROUTE_SERVICE"
  timeout 30 systemctl restart "$NGINX_SERVICE" || true
}

restart_ssh_stack() {
  log "action=restart_ssh_stack ssh_socket=$SSH_SOCKET_UNIT ssh_service=$SSH_SERVICE_UNIT"
  timeout 20 systemctl restart "$SSH_SOCKET_UNIT" || true
  timeout 20 systemctl restart "$SSH_SERVICE_UNIT" || true
}

restart_network_stack() {
  log "action=restart_network_stack network=$NETWORK_STACK_UNIT wait_unit=$NETWORK_WAIT_UNIT"
  timeout 30 systemctl restart "$NETWORK_STACK_UNIT" || true
  timeout 30 systemctl restart "$NETWORK_WAIT_UNIT" || true
  timeout 20 systemctl restart "$SSH_SOCKET_UNIT" || true
  timeout 20 systemctl restart "$SSH_SERVICE_UNIT" || true
  timeout 30 systemctl restart "$NGINX_SERVICE" || true
  timeout 30 systemctl restart "$BUS_ROUTE_SERVICE" || true
}

request_reboot() {
  local now_epoch="$1"
  if [[ "$AUTO_REBOOT_ON_HOST_FAILURE" != "1" ]]; then
    log "action=skip_reboot reason=auto_reboot_disabled"
    return
  fi
  if ! cooldown_ready "$last_reboot_epoch" "$REBOOT_COOLDOWN_SEC" "$now_epoch"; then
    log "action=skip_reboot reason=reboot_cooldown last_reboot_epoch=$last_reboot_epoch"
    return
  fi
  if (( reboot_count_day >= MAX_REBOOTS_PER_DAY )); then
    log "action=skip_reboot reason=max_reboots_per_day count=$reboot_count_day"
    return
  fi
  last_reboot_epoch="$now_epoch"
  reboot_count_day=$((reboot_count_day + 1))
  save_state
  log "action=reboot reason=host_unreachable_symptom combined_failures=$combined_failures public_failures=$public_failures"
  systemctl reboot
}

load_state
now_epoch="$(date +%s)"

app_service_ok=0
app_http_ok=0
public_http_ok=0
ssh_ok=0
network_ok=0
nginx_ok=0

check_systemd_active "$BUS_ROUTE_SERVICE" && app_service_ok=1 || true
check_systemd_active "$NGINX_SERVICE" && nginx_ok=1 || true
check_local_http && app_http_ok=1 || true
check_public_http && public_http_ok=1 || true
check_ssh_local && ssh_ok=1 || true
if check_default_route && check_metadata; then
  network_ok=1
fi

app_ok=0
if (( app_service_ok == 1 && app_http_ok == 1 )); then
  app_ok=1
fi

if (( app_ok == 1 )); then
  app_failures=0
else
  app_failures=$((app_failures + 1))
fi

if (( ssh_ok == 1 )); then
  ssh_failures=0
else
  ssh_failures=$((ssh_failures + 1))
fi

if (( public_http_ok == 1 && network_ok == 1 )); then
  public_failures=0
else
  public_failures=$((public_failures + 1))
fi

if (( app_ok == 1 && ssh_ok == 1 && public_http_ok == 1 && network_ok == 1 )); then
  combined_failures=0
else
  combined_failures=$((combined_failures + 1))
fi

log "status app_service_ok=$app_service_ok app_http_ok=$app_http_ok public_http_ok=$public_http_ok ssh_ok=$ssh_ok network_ok=$network_ok nginx_ok=$nginx_ok app_failures=$app_failures ssh_failures=$ssh_failures public_failures=$public_failures combined_failures=$combined_failures"

if (( app_failures >= APP_FAIL_THRESHOLD )) && cooldown_ready "$last_app_action_epoch" "$APP_ACTION_COOLDOWN_SEC" "$now_epoch"; then
  restart_app_stack || log "warn=restart_app_stack_failed"
  last_app_action_epoch="$now_epoch"
  app_failures=0
fi

if (( ssh_failures >= SSH_FAIL_THRESHOLD )) && cooldown_ready "$last_ssh_action_epoch" "$SSH_ACTION_COOLDOWN_SEC" "$now_epoch"; then
  restart_ssh_stack || log "warn=restart_ssh_stack_failed"
  last_ssh_action_epoch="$now_epoch"
  ssh_failures=0
fi

if (( public_failures >= PUBLIC_FAIL_THRESHOLD )) && cooldown_ready "$last_network_action_epoch" "$NETWORK_ACTION_COOLDOWN_SEC" "$now_epoch"; then
  restart_network_stack || log "warn=restart_network_stack_failed"
  last_network_action_epoch="$now_epoch"
  public_failures=0
fi

save_state

if (( combined_failures >= REBOOT_FAIL_THRESHOLD )); then
  request_reboot "$now_epoch"
fi

exit 0
