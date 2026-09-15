#!/bin/sh
# =============================================================================
# Container entrypoint — @pediatric-erp/api
#
# 1. Applies pending Prisma migrations to $DATABASE_URL (fails fast: set -e).
# 2. Starts the compiled NestJS API, replacing this shell so the Node process
#    becomes PID 1 and receives SIGTERM/SIGINT from the platform.
#
# All configuration comes from environment variables (never baked into the
# image): DATABASE_URL, JWT_SECRET, CORS_ORIGIN, NODE_ENV, PORT, LOG_LEVEL,
# THROTTLE_TTL_SECONDS, THROTTLE_LIMIT.
# =============================================================================
set -e

PRISMA_SCHEMA="${PRISMA_SCHEMA:-/app/packages/db/prisma/schema.prisma}"
API_ENTRYPOINT="${API_ENTRYPOINT:-/app/apps/api/dist/main.js}"

echo "[entrypoint] Applying pending database migrations..."
prisma migrate deploy --schema="$PRISMA_SCHEMA"

echo "[entrypoint] Migrations applied. Starting API on port ${PORT:-3001}..."
exec node "$API_ENTRYPOINT"
