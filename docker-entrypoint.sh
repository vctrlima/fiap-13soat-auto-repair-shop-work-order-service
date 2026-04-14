#!/bin/sh
set -e

echo "Starting Work Order Service..."

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Database setup complete!"

echo "Starting application..."
exec "$@"
