#!/usr/bin/env bash
set -euo pipefail
SCRIPT_NAME="${1:-remote-dev-*}"
cat >&2 <<EOF
[legacy] ${SCRIPT_NAME} 仍保留给历史 8134 开发流使用。
[legacy] 当前日常主流程已切到单实例 8133：
[legacy]   bash scripts/single-demo-deploy.sh
[legacy]   bash scripts/single-demo-status.sh
[legacy]   bash scripts/single-demo-smoke.sh
EOF
