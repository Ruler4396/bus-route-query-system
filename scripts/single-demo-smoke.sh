#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPECTED_ROUTE_COUNT="${BUS_ROUTE_EXPECTED_ROUTE_COUNT:-12}"
MIN_COVERAGE_PCT="${BUS_ROUTE_MIN_COVERAGE_PCT:-70}"
MAX_COVERAGE_PCT="${BUS_ROUTE_MAX_COVERAGE_PCT:-80}"
MYSQL_DB="${BUS_ROUTE_DEMO_DB:-springbootmf383}"
MYSQL_USER="${BUS_ROUTE_DEMO_DB_USER:-root}"
MYSQL_PASSWORD="${BUS_ROUTE_DEMO_DB_PASSWORD:-123456}"
LOCAL_FRONT_URL="${BUS_ROUTE_LOCAL_FRONT_URL:-http://127.0.0.1:8133/springbootmf383/front/index.html?route=routes}"
PUBLIC_FRONT_URL="${BUS_ROUTE_PUBLIC_FRONT_URL:-http://8.134.206.52:8133/springbootmf383/front/index.html?route=routes}"
LOCAL_ROUTE_LIST_URL="${BUS_ROUTE_LOCAL_ROUTE_LIST_URL:-http://127.0.0.1:8133/springbootmf383/gongjiaoluxian/list?page=1&limit=20}"
LOCAL_ALL_ROUTES_URL="${BUS_ROUTE_LOCAL_ALL_ROUTES_URL:-http://127.0.0.1:8133/springbootmf383/route/all-routes}"
LOCAL_PLAN_URL="${BUS_ROUTE_LOCAL_PLAN_URL:-http://127.0.0.1:8133/springbootmf383/route/plan?startStation=%E4%B8%9C%E5%B1%B1%E7%BD%B2%E5%89%8D%E8%B7%AF%E6%80%BB%E7%AB%99&endStation=%E7%8F%A0%E6%B1%9F%E5%8C%BB%E9%99%A2&profileType=WHEELCHAIR&preferenceType=ACCESSIBLE}"
RUN_UI=0
FAILURES=0

for arg in "$@"; do
  case "$arg" in
    --with-ui)
      RUN_UI=1
      ;;
    *)
      echo "unknown option: $arg" >&2
      echo "usage: bash scripts/single-demo-smoke.sh [--with-ui]" >&2
      exit 2
      ;;
  esac
done

pass() { echo "[ok] $*"; }
fail() { echo "[fail] $*" >&2; FAILURES=$((FAILURES + 1)); }

wait_for_front_ready() {
  local attempts=30
  local code=000
  while (( attempts > 0 )); do
    code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$LOCAL_FRONT_URL" || echo 000)"
    if [[ "$code" == "200" ]]; then
      pass "local front warmed up"
      return 0
    fi
    attempts=$((attempts - 1))
    sleep 1
  done
  fail "local front warmup timeout http=$code"
  return 1
}

check_service() {
  if systemctl is-active --quiet bus-route.service; then
    pass "bus-route.service active"
  else
    fail "bus-route.service inactive"
  fi

  if systemctl is-active --quiet bus-route-health-guardian.timer; then
    pass "bus-route-health-guardian.timer active"
  else
    fail "bus-route-health-guardian.timer inactive"
  fi

  if ss -ltn | grep -q ':8133 '; then
    pass "port 8133 listening"
  else
    fail "port 8133 not listening"
  fi
}

check_http() {
  local local_code public_code
  local_code="$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$LOCAL_FRONT_URL" || echo 000)"
  public_code="$(curl -s -o /dev/null -m 8 -w '%{http_code}' "$PUBLIC_FRONT_URL" || echo 000)"
  [[ "$local_code" == "200" ]] && pass "local front http 200" || fail "local front http=$local_code"
  [[ "$public_code" == "200" ]] && pass "public front http 200" || fail "public front http=$public_code"
}

check_routes() {
  local route_total all_routes_count plan_count
  route_total="$(curl -s "$LOCAL_ROUTE_LIST_URL" | python3 -c 'import sys,json; obj=json.load(sys.stdin); print((obj.get("data") or {}).get("total", -1))' 2>/dev/null || echo -1)"
  all_routes_count="$(curl -s "$LOCAL_ALL_ROUTES_URL" | python3 -c 'import sys,json; obj=json.load(sys.stdin); print(len(obj.get("data") or []))' 2>/dev/null || echo -1)"
  plan_count="$(curl -s "$LOCAL_PLAN_URL" | python3 -c 'import sys,json; obj=json.load(sys.stdin); print((obj.get("data") or {}).get("count", -1))' 2>/dev/null || echo -1)"

  [[ "$route_total" == "$EXPECTED_ROUTE_COUNT" ]] && pass "route list total=$route_total" || fail "route list total=$route_total expected=$EXPECTED_ROUTE_COUNT"
  [[ "$all_routes_count" == "$EXPECTED_ROUTE_COUNT" ]] && pass "all-routes count=$all_routes_count" || fail "all-routes count=$all_routes_count expected=$EXPECTED_ROUTE_COUNT"
  if [[ "$plan_count" =~ ^[0-9]+$ ]] && (( plan_count >= 1 )); then
    pass "route plan count=$plan_count"
  else
    fail "route plan count invalid: $plan_count"
  fi
}

check_db() {
  read -r db_route_count db_covered_count db_coverage_pct < <(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$MYSQL_DB" -N -e "SELECT COUNT(*), SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END), ROUND(100 * SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1) FROM gongjiaoluxian;" 2>/dev/null || printf '%s %s %s\n' -1 -1 -1)

  [[ "$db_route_count" == "$EXPECTED_ROUTE_COUNT" ]] && pass "mysql route_count=$db_route_count" || fail "mysql route_count=$db_route_count expected=$EXPECTED_ROUTE_COUNT"
  if [[ "$db_coverage_pct" =~ ^[0-9]+(\.[0-9]+)?$ ]] && python3 - "$db_coverage_pct" "$MIN_COVERAGE_PCT" "$MAX_COVERAGE_PCT" <<'PY'
import sys
value=float(sys.argv[1]); low=float(sys.argv[2]); high=float(sys.argv[3])
sys.exit(0 if low <= value <= high else 1)
PY
  then
    pass "mysql coverage=${db_coverage_pct}%"
  else
    fail "mysql coverage=${db_coverage_pct}% expected ${MIN_COVERAGE_PCT}-${MAX_COVERAGE_PCT}%"
  fi
  echo "[info] mysql covered_routes=${db_covered_count}"
}

check_versions() {
  local shell_version route_version
  shell_version="$(curl -s "$LOCAL_FRONT_URL" | grep -o 'shell-page.js?v=[0-9-]*' | head -n 1 || true)"
  route_version="$(curl -s 'http://127.0.0.1:8133/springbootmf383/front/pages/gongjiaoluxian/list.html' | grep -o 'route-list-page.js?v=[0-9-]*' | head -n 1 || true)"

  [[ -n "$shell_version" ]] && pass "$shell_version" || fail "shell page version marker missing"
  [[ -n "$route_version" ]] && pass "$route_version" || fail "route list version marker missing"
}

check_ui() {
  if [[ "$RUN_UI" != "1" ]]; then
    echo "[skip] UI smoke not requested"
    return
  fi
  if [[ ! -d "$ROOT_DIR/ui-automation/node_modules" ]]; then
    fail "ui-automation/node_modules missing; cannot run --with-ui"
    return
  fi

  local output
  if ! output="$(cd "$ROOT_DIR/ui-automation" && node - <<'NODE'
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto('http://127.0.0.1:8133/springbootmf383/front/index.html?route=routes', { waitUntil: 'networkidle' });
  const frame = page.frameLocator('#iframe');
  const start = frame.locator('#qidianzhanming');
  await start.click();
  await start.fill('珠');
  await page.waitForTimeout(300);
  const suggestions = await frame.locator('#routeStationSuggestionList option').evaluateAll(nodes => nodes.map(n => n.value));
  const secondary = frame.locator('.route-solution-secondary').first();
  const secondaryStyle = await secondary.evaluate(el => {
    const s = getComputedStyle(el);
    return { color: s.color, background: s.backgroundColor, border: s.borderColor, text: (el.textContent || '').trim() };
  });
  console.log(JSON.stringify({ suggestions, suggestionCount: suggestions.length, secondaryStyle }));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
NODE
)"; then
    fail "UI smoke execution failed"
    return
  fi

  echo "[info] ui_smoke=$output"
  python3 - <<'PY' "$output" || exit 1
import json, sys
obj=json.loads(sys.argv[1])
suggestions=obj.get('suggestions') or []
style=obj.get('secondaryStyle') or {}
if not suggestions:
    raise SystemExit(1)
if style.get('color') in ('rgb(255, 255, 255)', '#fff', '#ffffff'):
    raise SystemExit(1)
PY
  if [[ $? -eq 0 ]]; then
    pass "UI shortlist + secondary button visible"
  else
    fail "UI shortlist/button smoke failed"
  fi
}

check_service
wait_for_front_ready || true
check_http
check_routes
check_db
check_versions
check_ui

if (( FAILURES > 0 )); then
  echo "[result] smoke failed: $FAILURES issue(s)" >&2
  exit 1
fi

echo "[result] smoke passed"
