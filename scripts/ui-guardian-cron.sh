#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-/root/dev/bus-route-query-system}"
AUTOMATION_ROOT="${AUTOMATION_ROOT:-$PROJECT_ROOT/ui-automation}"
BASE_URL="${UI_BASE_URL:-http://127.0.0.1:8133/springbootmf383/front/}"
if [[ "${BASE_URL: -1}" != "/" ]]; then
  BASE_URL="${BASE_URL}/"
fi

mkdir -p "$AUTOMATION_ROOT/logs" "$AUTOMATION_ROOT/reports"

cd "$AUTOMATION_ROOT"

if [[ ! -d node_modules ]]; then
  npm install
fi

if [[ ! -d "$HOME/.cache/ms-playwright" ]]; then
  npx playwright install chromium
fi

export PROJECT_ROOT
export UI_BASE_URL="$BASE_URL"
export UI_WORKERS="${UI_WORKERS:-1}"
export PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL="${PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL:-0}"

node scripts/ui-guard.mjs >>"$AUTOMATION_ROOT/logs/ui-guardian.log" 2>&1
