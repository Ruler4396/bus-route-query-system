#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "$ROOT_DIR/scripts/legacy-dev-warning.sh" "$(basename "$0")" >&2 || true
cd "$ROOT_DIR"
JAR_PATH="$ROOT_DIR/target/springbootmf383-0.0.1-SNAPSHOT.jar"
RUNTIME_DIR="$ROOT_DIR/runtime/remote-dev"
PID_FILE="$RUNTIME_DIR/server.pid"
LOG_FILE="$RUNTIME_DIR/app.log"
PORT="${REMOTE_DEV_PORT:-8134}"
PROFILE="${REMOTE_DEV_PROFILE:-demo}"
JAVA_OPTS="${REMOTE_DEV_JAVA_OPTS:--Xms128m -Xmx384m -Dvehicle.ws.push-interval-ms=15000 -Djava.awt.headless=true}"
mkdir -p "$RUNTIME_DIR"
if [[ ! -f "$JAR_PATH" ]]; then
  echo "jar 不存在，请先执行: bash scripts/remote-dev-build.sh"
  exit 1
fi
if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "开发实例已运行，PID=$old_pid"
    echo "URL: http://127.0.0.1:$PORT/springbootmf383/front/index.html"
    exit 0
  fi
  rm -f "$PID_FILE"
fi
nohup bash -lc "cd '$ROOT_DIR' && exec nice -n 10 java $JAVA_OPTS -Dspring.profiles.active=$PROFILE -Dserver.port=$PORT -jar '$JAR_PATH'" >>"$LOG_FILE" 2>&1 &
new_pid=$!
echo "$new_pid" > "$PID_FILE"
echo "已启动开发实例，PID=$new_pid，日志=$LOG_FILE"
for _ in $(seq 1 60); do
  if ss -ltn | grep -q ":$PORT "; then
    if curl -fsS "http://127.0.0.1:$PORT/springbootmf383/front/index.html" >/dev/null 2>&1; then
      echo "开发实例就绪: http://127.0.0.1:$PORT/springbootmf383/front/index.html"
      exit 0
    fi
  fi
  sleep 1
done
echo "开发实例启动超时，请检查日志: $LOG_FILE"
tail -n 40 "$LOG_FILE" || true
exit 1
