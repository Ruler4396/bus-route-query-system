#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "--- bus-route.service ---"
systemctl status bus-route.service --no-pager -l | sed -n '1,40p'
echo
echo "--- port 8133 ---"
ss -ltnp | grep ':8133 ' || true
echo
echo "--- health guardian timer ---"
systemctl status bus-route-health-guardian.timer --no-pager -l | sed -n '1,30p' || true
echo
echo "--- guardian log tail ---"
tail -n 20 "$ROOT_DIR/runtime/host-guardian/guardian.log" || true
echo
echo "--- demo data baseline ---"
mysql -u root -p123456 -D springbootmf383 -N -e "
SELECT CONCAT('route_count=', COUNT(*)) FROM gongjiaoluxian;
SELECT CONCAT('covered_routes=', SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END)) FROM gongjiaoluxian;
SELECT CONCAT('covered_pct=', ROUND(100 * SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1)) FROM gongjiaoluxian;
" 2>/dev/null || true
echo
echo "--- front version markers ---"
curl -s 'http://127.0.0.1:8133/springbootmf383/front/index.html?route=routes' | grep -o 'shell-page.js?v=[0-9-]*' | head -n 1 || true
curl -s 'http://127.0.0.1:8133/springbootmf383/front/pages/gongjiaoluxian/list.html' | grep -o 'route-list-page.js?v=[0-9-]*' | head -n 1 || true
echo
echo "--- admin runtime assets ---"
bash "$ROOT_DIR/scripts/sync-admin-runtime-assets.sh" --check || true
