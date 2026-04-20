#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# npm run dev in sub-app-demo only builds the sub-app into root dist, and does not serve on a port.
(cd "$SCRIPT_DIR" && npm run dev -w sub-app-demo) &
SUB_PID=$!

# npm run dev in main-app serves the main app on a port (5173), and also serves the sub-app from root dist on http://localhost:5173/sub-app-demo/.
(cd "$SCRIPT_DIR" && npm run dev -w main-app) &
MAIN_PID=$!

trap "kill $MAIN_PID $SUB_PID" EXIT
wait
