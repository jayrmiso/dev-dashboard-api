#!/bin/bash

pkill -f "sam local" 2>/dev/null
pkill -f ngrok 2>/dev/null
sleep 1

trap "kill 0" EXIT

npx nodemon \
  --watch lambdas/src \
  --watch config/routes.json \
  --ext ts,json \
  --delay 1 \
  --signal SIGTERM \
  --exec "bash scripts/sam-start.sh" &

npx wait-on tcp:3001 -q 2>/dev/null

ngrok http 3001 --log stdout --log-format logfmt 2>&1 | while read line; do
  if echo "$line" | grep -q "url=https://"; then
    NGROK_URL=$(echo "$line" | grep -oP 'url=\K\S+')
    echo ""
    echo "Local:  http://127.0.0.1:3001"
    echo "Public: $NGROK_URL"
    echo ""
    echo "Ready."
  elif echo "$line" | grep -qE "err=|lvl=error|lvl=warn"; then
    echo "[ngrok] $line"
  fi
done &

wait
