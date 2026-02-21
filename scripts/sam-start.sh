#!/bin/bash

echo "Rebuilding..."
npx ts-node scripts/generate-sam-template.ts > /dev/null 2>&1

if ! sam build -t template.local.yaml > /dev/null 2>&1; then
  echo "Build failed:"
  sam build -t template.local.yaml
  exit 1
fi

echo "Starting API..."
CURRENT_LAMBDA=""
sam local start-api --warm-containers EAGER 2>&1 | while IFS= read -r line; do
  if echo "$line" | grep -q "Running on"; then
    echo "$line"
    echo "Ready."
  elif echo "$line" | grep -q "Mounting .* at"; then
    echo "$line"
  elif echo "$line" | grep -qE "ERROR|Error|Traceback|Failed"; then
    echo "$line"
  elif echo "$line" | grep -q "Lambda function '"; then
    CURRENT_LAMBDA=$(echo "$line" | grep -oP "Lambda function '\\K[^']+")
  elif echo "$line" | grep -qP '"\S+ /\S+ HTTP'; then
    method=$(echo "$line" | grep -oP '"\K\S+')
    path=$(echo "$line" | grep -oP '"\S+ \K/\S+')
    status=$(echo "$line" | grep -oP '" \K\d{3}')
    time=$(date +"%H:%M:%S")
    echo "[$time] $CURRENT_LAMBDA $method $path $status"
  elif echo "$line" | grep -qP "^\d{4}-\d{2}-\d{2}T.*INFO"; then
    msg=$(echo "$line" | sed 's/.*INFO\s*//')
    time=$(date +"%H:%M:%S")
    echo "[$time] $CURRENT_LAMBDA | $msg"
  elif echo "$line" | grep -qP "^\d{4}-\d{2}-\d{2}T.*(ERROR|WARN)"; then
    lvl=$(echo "$line" | grep -oP '(ERROR|WARN)')
    msg=$(echo "$line" | sed 's/.*\(ERROR\|WARN\)\s*//')
    time=$(date +"%H:%M:%S")
    echo "[$time] $CURRENT_LAMBDA $lvl | $msg"
  fi
done
