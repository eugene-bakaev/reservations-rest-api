#!/bin/sh
set -e

echo "[entrypoint] running migrations and seeding..."
node dist/db/migrate-cli.js

echo "[entrypoint] starting API..."
exec node dist/server.js
