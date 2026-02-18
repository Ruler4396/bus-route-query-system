#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAR_PATH="$ROOT_DIR/target/springbootmf383-0.0.1-SNAPSHOT.jar"
PID_FILE="/tmp/springbootmf383-lite.pid"
LOG_FILE="/tmp/springbootmf383-lite.log"

# 轻量模式参数：限制堆内存，降低定时推送频率，减少后台噪声
JAVA_OPTS_DEFAULT="-Xms128m -Xmx512m -Dvehicle.ws.push-interval-ms=10000 -Djava.awt.headless=true"

if [[ ! -f "$JAR_PATH" ]]; then
  echo "jar不存在，先执行: mvn -DskipTests package"
  exit 1
fi

# 启动MySQL容器（若已运行则无影响）
if command -v docker >/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' | grep -qx 'bus-route-mysql'; then
    echo "MySQL容器已运行"
  else
    if docker ps -a --format '{{.Names}}' | grep -qx 'bus-route-mysql'; then
      docker start bus-route-mysql >/dev/null
      echo "已启动已有MySQL容器 bus-route-mysql"
    else
      echo "未发现 bus-route-mysql 容器，请先手动启动数据库。"
    fi
  fi
fi

# 若已有旧进程则复用
if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "应用已运行，PID=$old_pid"
    exit 0
  fi
fi

nohup bash -lc "exec nice -n 10 java $JAVA_OPTS_DEFAULT -jar '$JAR_PATH'" >"$LOG_FILE" 2>&1 &
new_pid=$!
echo "$new_pid" >"$PID_FILE"
echo "已启动轻量模式应用，PID=$new_pid"
echo "日志: $LOG_FILE"

for _ in $(seq 1 60); do
  if ss -ltn '( sport = :8080 )' | grep -q 8080; then
    echo "应用就绪: http://127.0.0.1:8080/springbootmf383/front/index.html"
    exit 0
  fi
  sleep 1
done

echo "应用启动超时，请检查日志: $LOG_FILE"
exit 1
