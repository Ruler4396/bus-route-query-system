#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$PROJECT_ROOT/src/main/resources/front/front/tiles"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/offline-map-deploy.sh <tiles_source_path> [--clean]

Description:
  Deploy offline map tiles to:
  src/main/resources/front/front/tiles/{z}/{x}/{y}.png

Arguments:
  tiles_source_path   Tile source directory or archive file.
                      Supported archives: .zip .tar .tar.gz .tgz

Options:
  --clean             Remove existing files in target directory before deploy.

Examples:
  bash scripts/offline-map-deploy.sh /mnt/e/offline-tiles
  bash scripts/offline-map-deploy.sh /mnt/e/offline-tiles.tar.gz --clean
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

SOURCE_PATH="$1"
shift || true

CLEAN_BEFORE_DEPLOY=false
for arg in "$@"; do
  if [[ "$arg" == "--clean" ]]; then
    CLEAN_BEFORE_DEPLOY=true
  else
    echo "Unknown option: $arg" >&2
    usage
    exit 1
  fi
done

if [[ ! -e "$SOURCE_PATH" ]]; then
  echo "Source not found: $SOURCE_PATH" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

if $CLEAN_BEFORE_DEPLOY; then
  echo "[offline-map] cleaning target: $TARGET_DIR"
  find "$TARGET_DIR" -mindepth 1 ! -name 'README.txt' -exec rm -rf {} +
fi

tmp_dir=""
cleanup() {
  if [[ -n "$tmp_dir" && -d "$tmp_dir" ]]; then
    rm -rf "$tmp_dir"
  fi
}
trap cleanup EXIT

if [[ -d "$SOURCE_PATH" ]]; then
  echo "[offline-map] source type: directory"
  cp -a "$SOURCE_PATH"/. "$TARGET_DIR"/
else
  echo "[offline-map] source type: archive"
  tmp_dir="$(mktemp -d)"
  case "$SOURCE_PATH" in
    *.zip)
      unzip -q "$SOURCE_PATH" -d "$tmp_dir"
      ;;
    *.tar)
      tar -xf "$SOURCE_PATH" -C "$tmp_dir"
      ;;
    *.tar.gz|*.tgz)
      tar -xzf "$SOURCE_PATH" -C "$tmp_dir"
      ;;
    *)
      echo "Unsupported archive format: $SOURCE_PATH" >&2
      exit 1
      ;;
  esac
  cp -a "$tmp_dir"/. "$TARGET_DIR"/
fi

png_count="$(find "$TARGET_DIR" -type f -name '*.png' | wc -l | tr -d ' ')"
echo "[offline-map] deploy complete. png_count=$png_count"
echo "[offline-map] target: $TARGET_DIR"
echo "[offline-map] next: bash scripts/offline-map-check.sh"
