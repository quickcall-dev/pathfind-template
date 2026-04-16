#!/usr/bin/env bash
set -euo pipefail

SESSION="pathfinding-dev"
DIR="$(cd "$(dirname "$0")" && pwd)"

# ---------------------------------------------------------------
# Install dependencies if needed
# ---------------------------------------------------------------
if [ ! -d "$DIR/node_modules" ]; then
  echo "Installing dependencies..."
  cd "$DIR" && npm install
fi

# ---------------------------------------------------------------
# Kill existing session if it exists
tmux kill-session -t "$SESSION" 2>/dev/null || true

# Kill any lingering process on port 8080
fuser -k 8080/tcp 2>/dev/null || true
sleep 1

tmux new-session -d -s "$SESSION" -n server \
  "cd $DIR && npx http-server visual -p 8080 -c-1; read"

tmux new-window -t "$SESSION" -n tests \
  "cd $DIR && npx mocha --require should test/**/*.js; read"

tmux attach -t "$SESSION"
