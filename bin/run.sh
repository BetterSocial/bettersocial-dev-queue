#!/bin/sh

if [ "$MODE" = "webhook" ]; then
  npm run start
elif [ "$MODE" = "queue" ]; then
  npm run queue
else
  echo "Invalid \"MODE\" environment variable"
  echo "Valid values are: webhook, queue"
fi
