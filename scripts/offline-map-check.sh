#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/src/main/resources/front/front/js/config.js"
MAP_FILE="$PROJECT_ROOT/src/main/resources/front/front/pages/gongjiaoluxian/map.html"
TILES_DIR="$PROJECT_ROOT/src/main/resources/front/front/tiles"

fail_count=0

pass() { echo "[PASS] $1"; }
warn() { echo "[WARN] $1"; }
fail() { echo "[FAIL] $1"; fail_count=$((fail_count + 1)); }

if [[ -f "$CONFIG_FILE" ]]; then
  pass "config file exists: $CONFIG_FILE"
else
  fail "config file missing: $CONFIG_FILE"
fi

if [[ -f "$MAP_FILE" ]]; then
  pass "map page exists: $MAP_FILE"
else
  fail "map page missing: $MAP_FILE"
fi

if grep -Eq "leafletTileMode:[[:space:]]*['\"]offline['\"]" "$CONFIG_FILE"; then
  pass "leafletTileMode is offline"
else
  warn "leafletTileMode is not offline (can still work in online mode)"
fi

if grep -Eq "leafletOfflineTileUrl:[[:space:]]*['\"].+['\"]" "$CONFIG_FILE"; then
  offline_url="$(sed -n "s/.*leafletOfflineTileUrl:[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/p" "$CONFIG_FILE" | head -n 1)"
  pass "leafletOfflineTileUrl configured: ${offline_url:-<empty>}"
else
  fail "leafletOfflineTileUrl is not configured"
fi

if grep -q "getLeafletTileOptions" "$MAP_FILE" && grep -q "leafletTileMode" "$MAP_FILE"; then
  pass "map page contains offline/online tile switch logic"
else
  fail "map page does not contain tile switch logic"
fi

if [[ -d "$TILES_DIR" ]]; then
  pass "tiles dir exists: $TILES_DIR"
else
  fail "tiles dir missing: $TILES_DIR"
fi

png_count=0
if [[ -d "$TILES_DIR" ]]; then
  png_count="$(find "$TILES_DIR" -type f -name '*.png' | wc -l | tr -d ' ')"
fi

if [[ "$png_count" -gt 0 ]]; then
  pass "offline tiles found: $png_count png files"
else
  fail "no offline tiles found (*.png)"
fi

xyz_sample="$(find "$TILES_DIR" -type f -regextype posix-extended -regex '.*/[0-9]+/[0-9]+/[0-9]+\.png' | head -n 1 || true)"
if [[ -n "$xyz_sample" ]]; then
  pass "XYZ structure sample: $xyz_sample"
else
  warn "XYZ tile structure sample not detected"
fi

if [[ "$fail_count" -gt 0 ]]; then
  echo "offline-map-check: FAILED ($fail_count)"
  exit 1
fi

echo "offline-map-check: OK"
