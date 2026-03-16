#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
install -Dm644 "$ROOT_DIR/ops/systemd/bus-route-health-guardian.service" /etc/systemd/system/bus-route-health-guardian.service
install -Dm644 "$ROOT_DIR/ops/systemd/bus-route-health-guardian.timer" /etc/systemd/system/bus-route-health-guardian.timer
systemctl daemon-reload
systemctl enable --now bus-route-health-guardian.timer
systemctl start bus-route-health-guardian.service
systemctl status bus-route-health-guardian.timer --no-pager -l | sed -n 1,40p
