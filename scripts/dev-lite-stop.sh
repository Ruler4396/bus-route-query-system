#!/usr/bin/env bash
set -euo pipefail

PID_FILE="/tmp/springbootmf383-lite.pid"

stop_pid() {
  local pid="$1"
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" || true
    sleep 1
    kill -9 "$pid" 2>/dev/null || true
    echo "已停止进程 PID=$pid"
  fi
}

if [[ -f "$PID_FILE" ]]; then
  pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${pid:-}" ]]; then
    stop_pid "$pid"
  fi
  rm -f "$PID_FILE"
fi

# 清理可能的手工启动实例（无匹配时不报错）
(pgrep -af '[j]ava -jar .*springbootmf383-0.0.1-SNAPSHOT.jar' || true) | awk '{print $1}' | while read -r p; do
  [[ -n "${p:-}" ]] && stop_pid "$p"
done

if ss -ltn '( sport = :8080 )' | grep -q 8080; then
  echo "8080 仍被占用："
  ss -ltnp | rg 8080 || true
else
  echo "应用已停止（8080已释放）"
fi
