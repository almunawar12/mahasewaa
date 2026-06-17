#!/bin/sh
set -e

# Run pending DB migrations against DIRECT_URL (from prisma.config.ts).
# Set RUN_MIGRATIONS=false to skip (e.g. if migrations run elsewhere).
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "==> Running prisma migrate deploy..."
  ./node_modules/.bin/prisma migrate deploy
else
  echo "==> Skipping migrations (RUN_MIGRATIONS=false)"
fi

echo "==> Starting app: $*"
exec "$@"
