#!/usr/bin/env bash
set -euo pipefail

docker rm -f bus-route-app >/dev/null 2>&1 || true
echo "已停止并移除容器: bus-route-app"

