#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="$ROOT_DIR/runtime/remote-dev"
PID_FILE="$RUNTIME_DIR/server.pid"
LOG_FILE="$RUNTIME_DIR/app.log"
PORT="${REMOTE_DEV_PORT:-8134}"
if [[ -f "$PID_FILE" ]]; then
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
    echo "开发实例运行中，PID=$pid"
  else
    echo "PID 文件存在，但进程不存在"
  fi
else
  echo "开发实例未启动"
fi
ss -ltnp | grep ":$PORT" || true
if [[ -f "$LOG_FILE" ]]; then
  echo "--- tail: $LOG_FILE ---"
  tail -n 20 "$LOG_FILE" || true
fi
