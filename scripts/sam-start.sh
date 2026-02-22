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
LOG_COLOR=""
sam local start-api --port 3001 --warm-containers EAGER 2>&1 | while IFS= read -r line; do
  if echo "$line" | grep -q "Running on"; then
    echo "$line"
    echo "Ready."
  elif echo "$line" | grep -q "Mounting .* at"; then
    echo "$line"
  elif echo "$line" | grep -qE "ERROR|Error|Traceback|Failed"; then
    LOG_COLOR='\033[0;31m'
    printf '\033[0;31m%s\033[0m\n' "$line"
  elif echo "$line" | grep -q "Lambda function '"; then
    CURRENT_LAMBDA=$(echo "$line" | grep -oP "Lambda function '\\K[^']+")
    LOG_COLOR=""
  elif echo "$line" | grep -qP '"\S+ /\S+ HTTP'; then
    method=$(echo "$line" | grep -oP '"\K\S+')
    path=$(echo "$line" | grep -oP '"\S+ \K/\S+')
    status=$(echo "$line" | grep -oP '" \K\d{3}')
    time=$(date +"%H:%M:%S")
    LOG_COLOR=""
    if [[ "$status" =~ ^2 ]]; then
      sc='\033[0;32m'
    elif [[ "$status" =~ ^4 ]]; then
      sc='\033[0;33m'
    else
      sc='\033[0;31m'
    fi
    printf '\033[2m[%s]\033[0m \033[0;35m%s\033[0m \033[0;36m%s\033[0m %s %b%s\033[0m\n' "$time" "$CURRENT_LAMBDA" "$method" "$path" "$sc" "$status"
  elif echo "$line" | grep -qP "^\d{4}-\d{2}-\d{2}T.*INFO"; then
    msg=$(echo "$line" | sed 's/.*INFO\s*//')
    time=$(date +"%H:%M:%S")
    LOG_COLOR=""
    printf '\033[2m[%s]\033[0m \033[0;35m%s\033[0m %s\n' "$time" "$CURRENT_LAMBDA" "$msg"
  elif echo "$line" | grep -qP "^\d{4}-\d{2}-\d{2}T.*(ERROR|WARN)"; then
    lvl=$(echo "$line" | grep -oP '(ERROR|WARN)')
    msg=$(echo "$line" | sed 's/.*\(ERROR\|WARN\)\s*//')
    time=$(date +"%H:%M:%S")
    if [ "$lvl" = "ERROR" ]; then
      LOG_COLOR='\033[0;31m'
    else
      LOG_COLOR='\033[0;33m'
    fi
    printf '\033[2m[%s]\033[0m \033[0;35m%s\033[0m %b%s\033[0m %s\n' "$time" "$CURRENT_LAMBDA" "$LOG_COLOR" "$lvl" "$msg"
  elif [ -n "$CURRENT_LAMBDA" ]; then
    time=$(date +"%H:%M:%S")
    if [ -n "$LOG_COLOR" ]; then
      printf '\033[2m[%s]\033[0m \033[0;35m%s\033[0m %b%s\033[0m\n' "$time" "$CURRENT_LAMBDA" "$LOG_COLOR" "$line"
    else
      printf '\033[2m[%s]\033[0m \033[0;35m%s\033[0m %s\n' "$time" "$CURRENT_LAMBDA" "$line"
    fi
  fi
done
