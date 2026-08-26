#!/bin/bash
set -e

echo "=== ViaNordTrans Production Start ==="

# Find mongod dynamically - works regardless of nix store hash
MONGOD=$(which mongod 2>/dev/null || find /nix/store -name mongod -path "*/bin/mongod" -type f 2>/dev/null | head -1)

if [ -z "$MONGOD" ]; then
  echo "ERROR: mongod binary not found"
  exit 1
fi

echo "MongoDB binary: $MONGOD"
$MONGOD --version | head -1

# Start MongoDB
mkdir -p /tmp/mongodb/data
$MONGOD \
  --dbpath /tmp/mongodb/data \
  --fork \
  --logpath /tmp/mongodb/mongod.log \
  --bind_ip 127.0.0.1 \
  --port 27017

echo "MongoDB started"
sleep 2

# Start FastAPI serving on port 5000 (also serves React build)
echo "Starting backend on port 5000..."
cd /home/runner/workspace/backend
exec uvicorn server:app --host 0.0.0.0 --port 5000
