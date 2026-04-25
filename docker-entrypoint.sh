#!/bin/sh
set -e

echo "Starting Work Order Service..."

echo "Syncing database schema..."
npx prisma db push --accept-data-loss

echo "Starting application..."
exec "$@"
