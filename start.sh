#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# npm run dev in sub-app-demo only builds the sub-app hotly, and does not serve on a port.
(cd "$SCRIPT_DIR/sub-app-demo" && npm run dev) &
SUB_PID=$!

# npm run dev in main-app serves the main app on a port (5173), and also hotly serves the sub-app on sub router (http://localhost:5173/sub-app-demo).
(cd "$SCRIPT_DIR/main-app" && npm run dev) &
MAIN_PID=$!

trap "kill $MAIN_PID $SUB_PID" EXIT
wait
