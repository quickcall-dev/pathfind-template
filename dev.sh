#!/usr/bin/env bash
set -euo pipefail

SESSION="pathfinding-dev"
DIR="$(cd "$(dirname "$0")" && pwd)"

# ---------------------------------------------------------------
# Load nvm if present (so node/npx resolve when invoked from non-interactive shells)
# ---------------------------------------------------------------
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
fi

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

# Kill any lingering process on port 8080 (cross-platform: macOS uses lsof, Linux has fuser)
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:8080 || true)"
  [ -n "$PIDS" ] && kill -9 $PIDS 2>/dev/null || true
elif command -v fuser >/dev/null 2>&1; then
  fuser -k 8080/tcp 2>/dev/null || true
fi
sleep 1

# Resolve npx in the current shell (tmux panes may not source nvm)
NPX="$(command -v npx || true)"
if [ -z "$NPX" ]; then
  echo "Error: npx not found on PATH. Install Node.js or source your nvm setup before running this script." >&2
  exit 1
fi

# Pass parent PATH into tmux so node/npx resolve inside panes
tmux new-session -d -s "$SESSION" -n server -e "PATH=$PATH" \
  "cd $DIR && $NPX http-server visual -p 8080 -c-1; read"

tmux new-window -t "$SESSION" -n tests -e "PATH=$PATH" \
  "cd $DIR && $NPX mocha --require should test/**/*.js; read"

tmux attach -t "$SESSION"
