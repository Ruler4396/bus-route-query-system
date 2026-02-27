#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${TARGET_ENV_FILE:-$ROOT_DIR/scripts/server-target.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[remote-ssh] missing env file: $ENV_FILE"
  exit 1
fi

# shellcheck source=/dev/null
source "$ENV_FILE"

if [[ ! -f "$TARGET_SERVER_SSH_KEY" ]]; then
  echo "[remote-ssh] ssh key not found: $TARGET_SERVER_SSH_KEY"
  exit 1
fi

TARGET="${TARGET_SERVER_USER}@${TARGET_SERVER_HOST}"
SSH_OPTS=(-i "$TARGET_SERVER_SSH_KEY" -o StrictHostKeyChecking=no)

if [[ $# -eq 0 ]]; then
  exec ssh "${SSH_OPTS[@]}" "$TARGET"
fi

exec ssh "${SSH_OPTS[@]}" "$TARGET" "$@"

