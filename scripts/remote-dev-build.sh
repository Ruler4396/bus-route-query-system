#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
export MAVEN_OPTS="${MAVEN_OPTS:--Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m}"
bash "$ROOT_DIR/scripts/sync-admin-runtime-assets.sh" --sync
bash "$ROOT_DIR/scripts/remote-dev-check.sh"
echo "[build] mvn -q -DskipTests package"
mvn -q -DskipTests package
echo "[ok] package created: $ROOT_DIR/target/springbootmf383-0.0.1-SNAPSHOT.jar"
