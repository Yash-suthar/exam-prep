#!/usr/bin/env bash
set -euo pipefail

HOST="${ORACLE_HOST:-ubuntu@144.24.117.17}"
KEY="${ORACLE_SSH_KEY:-$HOME/.ssh/oracle-ubuntu.key}"
REMOTE_DIR="${ORACLE_APP_DIR:-$HOME/exam-prep}"

ssh -i "$KEY" -o StrictHostKeyChecking=accept-new "$HOST" bash -s <<EOF
set -euo pipefail
if [ ! -d "$REMOTE_DIR/.git" ]; then
  git clone https://github.com/Yash-suthar/exam-prep.git "$REMOTE_DIR"
fi
cd "$REMOTE_DIR"
git fetch origin
git checkout main
git pull --ff-only origin main
if [ ! -f .env ]; then
  echo "Missing $REMOTE_DIR/.env on the Oracle host." >&2
  exit 1
fi
docker compose up -d --build app db
docker compose up -d tunnel
EOF
