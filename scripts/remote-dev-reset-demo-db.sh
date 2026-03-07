#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT_DIR/data"
DB_PREFIX="$DATA_DIR/springbootmf383-demo"

echo "[reset-demo] stop dev instance"
bash "$ROOT_DIR/scripts/remote-dev-stop.sh" || true

echo "[reset-demo] remove old demo database files"
rm -f "${DB_PREFIX}.mv.db" "${DB_PREFIX}.lock.db"

echo "[reset-demo] rebuild jar"
bash "$ROOT_DIR/scripts/remote-dev-build.sh"

echo "[reset-demo] restart dev instance with fresh H2 demo data"
bash "$ROOT_DIR/scripts/remote-dev-start.sh"

echo "[reset-demo] done"
