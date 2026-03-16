#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$ROOT_DIR/runtime/manual-backups/single-demo-deploy-$(date +%Y%m%d_%H%M%S)"
JAR_PATH="$ROOT_DIR/target/springbootmf383-0.0.1-SNAPSHOT.jar"
mkdir -p "$BACKUP_DIR"
if [[ -f "$JAR_PATH" ]]; then
  cp -a "$JAR_PATH" "$BACKUP_DIR/target.jar.bak"
fi
cp -a /etc/systemd/system/bus-route.service "$BACKUP_DIR/bus-route.service.bak" 2>/dev/null || true
bash "$ROOT_DIR/scripts/remote-dev-build.sh"
systemctl restart bus-route.service
for _ in $(seq 1 40); do
  if curl -fsS http://127.0.0.1:8133/springbootmf383/front/index.html >/dev/null 2>&1; then
    echo "single demo ready: http://127.0.0.1:8133/springbootmf383/front/index.html"
    exit 0
  fi
  sleep 1
done
echo "single demo deploy timeout; check: systemctl status bus-route.service"
exit 1
