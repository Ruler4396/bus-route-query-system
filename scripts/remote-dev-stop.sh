#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/runtime/remote-dev"
PID_FILE="$RUNTIME_DIR/server.pid"
stop_one() {
  local pid="$1"
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" || true
    sleep 1
    kill -9 "$pid" 2>/dev/null || true
    echo "已停止 PID=$pid"
  fi
}
if [[ -f "$PID_FILE" ]]; then
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${pid:-}" ]]; then
    stop_one "$pid"
  fi
  rm -f "$PID_FILE"
else
  echo "未发现开发实例 PID 文件"
fi
