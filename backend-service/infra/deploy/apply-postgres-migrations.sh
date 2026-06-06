#!/usr/bin/env sh
set -eu

MIGRATIONS_DIR="${MIGRATIONS_DIR:-../backend/migrations}"
DATABASE_URL="${DATABASE_URL:?DATABASE_URL is required}"

for migration in "$MIGRATIONS_DIR"/*.sql; do
  echo "Applying $migration"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done
