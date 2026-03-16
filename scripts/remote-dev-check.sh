#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
export MAVEN_OPTS="${MAVEN_OPTS:--Xms128m -Xmx512m -XX:MaxMetaspaceSize=256m}"
bash "$ROOT_DIR/scripts/sync-admin-runtime-assets.sh" --check
echo "[check] mvn -q -DskipTests compile"
mvn -q -DskipTests compile
echo "[ok] compile check passed"
