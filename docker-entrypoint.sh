#!/bin/sh
set -eu

echo "Applying database migrations..."
pnpm db:deploy

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "Seeding demo data..."
  pnpm db:seed
fi

exec pnpm start
