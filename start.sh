#!/bin/bash
cd main-app && npm run dev &
MAIN_PID=$!
cd sub-app-demo && npm run dev -- --port 5174 &
SUB_PID=$!

trap "kill $MAIN_PID $SUB_PID" EXIT
wait
