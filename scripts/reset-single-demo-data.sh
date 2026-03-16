#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_FILE="$ROOT_DIR/src/main/resources/data-demo.sql"
BACKUP_DIR="$ROOT_DIR/runtime/manual-backups/reset-single-demo-data-$(date +%Y%m%d_%H%M%S)"
MYSQL_DB="${BUS_ROUTE_DEMO_DB:-springbootmf383}"
MYSQL_USER="${BUS_ROUTE_DEMO_DB_USER:-root}"
MYSQL_PASSWORD="${BUS_ROUTE_DEMO_DB_PASSWORD:-123456}"
WITH_CONTENT=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --with-content)
      WITH_CONTENT=1
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    *)
      echo "unknown option: $arg" >&2
      echo "usage: bash scripts/reset-single-demo-data.sh [--with-content] [--dry-run]" >&2
      exit 2
      ;;
  esac
done

mkdir -p "$BACKUP_DIR"
MYSQL=(mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB")
MYSQLDUMP=(mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DB")

if [[ ! -f "$SQL_FILE" ]]; then
  echo "[error] demo SQL not found: $SQL_FILE" >&2
  exit 1
fi

tables=(gongjiaoluxian zhandian_wuzhangai)
if [[ "$WITH_CONTENT" == "1" ]]; then
  tables+=(wangzhangonggao youqinglianjie messages)
fi

column_exists() {
  local table="$1"
  local column="$2"
  "${MYSQL[@]}" -N -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='${MYSQL_DB}' AND TABLE_NAME='${table}' AND COLUMN_NAME='${column}';"
}

ensure_messages_schema() {
  local after_column="rpicture"
  local -a defs=(
    "feedback_type VARCHAR(100) NULL"
    "severity_level VARCHAR(50) NULL"
    "route_id BIGINT NULL"
    "route_name VARCHAR(200) NULL"
    "station_name VARCHAR(200) NULL"
    "handle_status VARCHAR(50) NULL"
    "audit_owner VARCHAR(200) NULL"
    "review_notes TEXT NULL"
    "reviewed_at DATETIME NULL"
  )
  for definition in "${defs[@]}"; do
    local name="${definition%% *}"
    if [[ "$(column_exists messages "$name")" == "0" ]]; then
      echo "[schema] add messages.$name"
      "${MYSQL[@]}" -e "ALTER TABLE messages ADD COLUMN ${definition} AFTER ${after_column};"
    fi
    after_column="$name"
  done
}

extract_merge_block() {
  local table="$1"
  awk -v table="$table" '
    BEGIN { capture = 0 }
    $0 ~ "^MERGE INTO " table " " {
      capture = 1
      sub(/^MERGE INTO/, "REPLACE INTO")
      print
      next
    }
    capture && /^KEY\(id\)$/ { next }
    capture { print }
    capture && /;[[:space:]]*$/ { exit }
  ' "$SQL_FILE"
}

echo "[mode] dry_run=$DRY_RUN with_content=$WITH_CONTENT"
ensure_messages_schema
for table in "${tables[@]}"; do
  block="$(extract_merge_block "$table")"
  if [[ -z "$block" ]]; then
    echo "[error] no merge block found for $table in $SQL_FILE" >&2
    exit 1
  fi
  printf '%s\n' "$block" > "$BACKUP_DIR/${table}.baseline.sql"
  echo "[prepare] $table baseline extracted -> $BACKUP_DIR/${table}.baseline.sql"
done

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[dry-run] skip backup + import"
  echo "[dry-run] current database stats:"
  "${MYSQL[@]}" -N -e "
  SELECT CONCAT('route_count=', COUNT(*)) FROM gongjiaoluxian;
  SELECT CONCAT('covered_routes=', SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END)) FROM gongjiaoluxian;
  SELECT CONCAT('covered_pct=', ROUND(100 * SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1)) FROM gongjiaoluxian;
  SELECT CONCAT('station_a11y_count=', COUNT(*)) FROM zhandian_wuzhangai;
  "
  exit 0
fi

echo "[backup] $BACKUP_DIR"
for table in "${tables[@]}"; do
  echo "[backup] dump $table"
  "${MYSQLDUMP[@]}" "$table" > "$BACKUP_DIR/${table}.live.sql"
done

for table in "${tables[@]}"; do
  echo "[reset] clear $table"
  "${MYSQL[@]}" -e "DELETE FROM ${table};"
  echo "[reset] import baseline $table"
  "${MYSQL[@]}" < "$BACKUP_DIR/${table}.baseline.sql"
done

echo "[verify] route totals"
"${MYSQL[@]}" -N -e "
SELECT CONCAT('route_count=', COUNT(*)) FROM gongjiaoluxian;
SELECT CONCAT('covered_routes=', SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END)) FROM gongjiaoluxian;
SELECT CONCAT('covered_pct=', ROUND(100 * SUM(CASE WHEN wuzhangaijibie IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1)) FROM gongjiaoluxian;
SELECT CONCAT('station_a11y_count=', COUNT(*)) FROM zhandian_wuzhangai;
"

echo "[done] single demo data baseline restored"
