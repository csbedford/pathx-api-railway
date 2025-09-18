#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
exec npx tsx src/index.ts