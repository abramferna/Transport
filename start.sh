#!/bin/bash
set -e

# Start MongoDB if not already running
MONGO_BIN="/nix/store/3z9iq2gr9ddb0ncmxjlv81ngn6b4nm70-mongodb-6.0.5/bin/mongod"
MONGO_DATA="/tmp/mongodb/data"
MONGO_LOG="/tmp/mongodb/mongod.log"

mkdir -p "$MONGO_DATA"

if ! pgrep -x mongod > /dev/null 2>&1; then
  echo "Starting MongoDB..."
  "$MONGO_BIN" --dbpath "$MONGO_DATA" --fork --logpath "$MONGO_LOG" --bind_ip 127.0.0.1 --port 27017
  sleep 2
  echo "MongoDB started."
else
  echo "MongoDB already running."
fi

# Start backend in background
echo "Starting backend..."
cd /home/runner/workspace/backend
uvicorn server:app --host localhost --port 8001 --reload &
BACKEND_PID=$!
echo "Backend started (PID $BACKEND_PID)"

cd /home/runner/workspace/frontend

# Start frontend
echo "Starting frontend..."
exec yarn start
