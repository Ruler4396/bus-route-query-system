#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${TARGET_ENV_FILE:-$ROOT_DIR/scripts/server-target.env}"
SKIP_PULL=0

if [[ "${1:-}" == "--skip-pull" ]]; then
  SKIP_PULL=1
  shift
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[remote-deploy] missing env file: $ENV_FILE"
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

if [[ ! -f "$TARGET_SERVER_SSH_KEY" ]]; then
  echo "[remote-deploy] ssh key not found: $TARGET_SERVER_SSH_KEY"
  exit 1
fi

TARGET="${TARGET_SERVER_USER}@${TARGET_SERVER_HOST}"
SSH=(ssh -i "$TARGET_SERVER_SSH_KEY" -o StrictHostKeyChecking=no "$TARGET")

"${SSH[@]}" \
  TARGET_SERVER_PROJECT_ROOT="$TARGET_SERVER_PROJECT_ROOT" \
  TARGET_SERVER_APP_PORT="$TARGET_SERVER_APP_PORT" \
  TARGET_SERVER_HOST="$TARGET_SERVER_HOST" \
  SKIP_PULL="$SKIP_PULL" \
  'bash -s' <<'REMOTE_SCRIPT'
set -euo pipefail

cd "$TARGET_SERVER_PROJECT_ROOT"
echo "[deploy] host: $(hostname)"
echo "[deploy] path: $PWD"

if [[ "$SKIP_PULL" -eq 0 ]]; then
  git pull --ff-only
else
  echo "[deploy] skip git pull"
fi

mvn -DskipTests clean package
systemctl restart bus-route.service
systemctl is-active --quiet bus-route.service
curl -fsS "http://127.0.0.1:$TARGET_SERVER_APP_PORT/springbootmf383/front/index.html" >/dev/null
echo "[deploy] ok: http://$TARGET_SERVER_HOST:$TARGET_SERVER_APP_PORT/springbootmf383/front/index.html"
REMOTE_SCRIPT
