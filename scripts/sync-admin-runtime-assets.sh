#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADMIN_DIR="$ROOT_DIR/src/main/resources/admin/admin"
PUBLIC_DIR="$ADMIN_DIR/public"
DIST_DIR="$ADMIN_DIR/dist"
VERSION_FILE="$ADMIN_DIR/admin-runtime.version"
MODE="sync"
OVERRIDE_VERSION=""

usage() {
  cat <<'EOF'
usage: bash scripts/sync-admin-runtime-assets.sh [--sync|--check] [--version VERSION]

--sync   Copy admin runtime CSS/JS from public -> dist and align public/dist index version markers.
--check  Verify admin runtime CSS/JS and version markers are aligned; make no changes.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sync)
      MODE="sync"
      ;;
    --check)
      MODE="check"
      ;;
    --version)
      shift
      [[ $# -gt 0 ]] || { echo "missing value for --version" >&2; exit 2; }
      OVERRIDE_VERSION="$1"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

resolve_version() {
  if [[ -n "$OVERRIDE_VERSION" ]]; then
    printf '%s
' "$OVERRIDE_VERSION"
    return 0
  fi
  if [[ -f "$VERSION_FILE" ]]; then
    tr -d '[:space:]' < "$VERSION_FILE"
    return 0
  fi
  echo "admin runtime version file missing: $VERSION_FILE" >&2
  exit 1
}

ADMIN_RUNTIME_VERSION="$(resolve_version)"
[[ "$ADMIN_RUNTIME_VERSION" =~ ^[0-9]{8}-[0-9]{3}$ ]] || {
  echo "invalid admin runtime version: $ADMIN_RUNTIME_VERSION" >&2
  exit 1
}

PUBLIC_CSS="$PUBLIC_DIR/css/transit-admin-theme.css"
PUBLIC_JS="$PUBLIC_DIR/js/transit-admin-sidebar-dom.js"
DIST_CSS="$DIST_DIR/css/transit-admin-theme.css"
DIST_JS="$DIST_DIR/js/transit-admin-sidebar-dom.js"
PUBLIC_INDEX="$PUBLIC_DIR/index.html"
DIST_INDEX="$DIST_DIR/index.html"

for required in "$PUBLIC_CSS" "$PUBLIC_JS" "$PUBLIC_INDEX" "$DIST_INDEX"; do
  [[ -f "$required" ]] || { echo "required file missing: $required" >&2; exit 1; }
done
mkdir -p "$(dirname "$DIST_CSS")" "$(dirname "$DIST_JS")"

update_index_version() {
  local file="$1"
  python3 - "$file" "$ADMIN_RUNTIME_VERSION" <<'PY'
from pathlib import Path
import re
import sys
path = Path(sys.argv[1])
version = sys.argv[2]
text = path.read_text(encoding='utf-8')
patterns = {
    r'(transit-admin-theme\.css\?v=)([0-9-]+)': r'\g<1>' + version,
    r'(transit-admin-sidebar-dom\.js\?v=)([0-9-]+)': r'\g<1>' + version,
}
updated = text
for pattern, repl in patterns.items():
    updated, count = re.subn(pattern, repl, updated)
    if count == 0:
        raise SystemExit(f'missing version marker for pattern: {pattern} in {path}')
if updated != text:
    path.write_text(updated, encoding='utf-8')
PY
}

if [[ "$MODE" == "sync" ]]; then
  cp -f "$PUBLIC_CSS" "$DIST_CSS"
  cp -f "$PUBLIC_JS" "$DIST_JS"
  update_index_version "$PUBLIC_INDEX"
  update_index_version "$DIST_INDEX"
  printf '%s
' "$ADMIN_RUNTIME_VERSION" > "$VERSION_FILE"
fi

cmp -s "$PUBLIC_CSS" "$DIST_CSS" || { echo "admin runtime css mismatch: public vs dist" >&2; exit 1; }
cmp -s "$PUBLIC_JS" "$DIST_JS" || { echo "admin runtime js mismatch: public vs dist" >&2; exit 1; }

grep -q "transit-admin-theme.css?v=$ADMIN_RUNTIME_VERSION" "$PUBLIC_INDEX" || { echo "public index admin css version mismatch" >&2; exit 1; }
grep -q "transit-admin-sidebar-dom.js?v=$ADMIN_RUNTIME_VERSION" "$PUBLIC_INDEX" || { echo "public index admin js version mismatch" >&2; exit 1; }
grep -q "transit-admin-theme.css?v=$ADMIN_RUNTIME_VERSION" "$DIST_INDEX" || { echo "dist index admin css version mismatch" >&2; exit 1; }
grep -q "transit-admin-sidebar-dom.js?v=$ADMIN_RUNTIME_VERSION" "$DIST_INDEX" || { echo "dist index admin js version mismatch" >&2; exit 1; }

echo "admin_runtime_version=$ADMIN_RUNTIME_VERSION"
echo "admin_runtime_assets=ok"
echo "admin_runtime_mode=$MODE"
