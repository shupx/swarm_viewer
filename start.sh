#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAIN_APP_PORT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      MAIN_APP_PORT="$2"
      shift 2
      ;;
    --port=*)
      MAIN_APP_PORT="${1#*=}"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# pnpm run dev in sub-app-demo only builds the sub-app into root dist, and does not serve on a port.
(cd "$SCRIPT_DIR" && pnpm --filter sub-app-demo dev) &
SUB_PID=$!

# pnpm run dev in main-app serves the main app on a port (5173 by default), and also serves the sub-app from root dist on http://localhost:<port>/sub-app-demo/.
if [[ -n "$MAIN_APP_PORT" ]]; then
  (cd "$SCRIPT_DIR" && PORT="$MAIN_APP_PORT" pnpm --filter main-app dev) &
else
  (cd "$SCRIPT_DIR" && pnpm --filter main-app dev) &
fi
MAIN_PID=$!

trap "kill $MAIN_PID $SUB_PID" EXIT
wait
