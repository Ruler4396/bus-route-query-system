#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JAR_PATH="$ROOT_DIR/target/springbootmf383-0.0.1-SNAPSHOT.jar"
APP_IMAGE="bus-route-query-system-app:latest"

if [[ ! -f "$JAR_PATH" ]]; then
  echo "jar不存在，先执行: mvn -DskipTests package"
  exit 1
fi

# 缺少应用镜像时自动构建
if ! docker image inspect "$APP_IMAGE" >/dev/null 2>&1; then
  echo "未发现应用镜像 $APP_IMAGE，开始构建..."
  docker build -t "$APP_IMAGE" "$ROOT_DIR"
fi

if ! docker ps --format '{{.Names}}' | grep -qx 'bus-route-mysql'; then
  if docker ps -a --format '{{.Names}}' | grep -qx 'bus-route-mysql'; then
    docker start bus-route-mysql >/dev/null
    echo "已启动 MySQL 容器 bus-route-mysql"
  else
    echo "未找到 MySQL 容器 bus-route-mysql，尝试通过 docker compose 创建 mysql 服务..."
    (cd "$ROOT_DIR" && docker compose up -d mysql)
  fi
fi

docker rm -f bus-route-app >/dev/null 2>&1 || true

docker run -d \
  --name bus-route-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL='jdbc:mysql://host.docker.internal:3306/springbootmf383?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai' \
  -e SPRING_DATASOURCE_USERNAME='root' \
  -e SPRING_DATASOURCE_PASSWORD='123456' \
  -e TZ='Asia/Shanghai' \
  -v "$JAR_PATH:/app/app.jar:ro" \
  "$APP_IMAGE" >/dev/null

echo "已启动容器: bus-route-app"
echo "访问地址: http://localhost:8080/springbootmf383/front/index.html"
