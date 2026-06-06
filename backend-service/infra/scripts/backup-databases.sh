#!/usr/bin/env sh
set -eu

BACKUP_DIR="${BACKUP_DIR:-./backups}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-agentpay-postgres}"
MONGO_CONTAINER="${MONGO_CONTAINER:-agentpay-mongo}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"

docker exec "$POSTGRES_CONTAINER" pg_dump -U agentpay agentpay > "$BACKUP_DIR/postgres-agentpay-$STAMP.sql"
docker exec "$MONGO_CONTAINER" mongodump --archive > "$BACKUP_DIR/mongo-agentpay-$STAMP.archive"
