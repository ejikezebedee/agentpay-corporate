#!/usr/bin/env sh
set -eu

MONGODB_URL="${MONGODB_URL:?MONGODB_URL is required}"
MONGODB_DATABASE="${MONGODB_DATABASE:-agentpay}"
MONGODB_COLLECTION="${MONGODB_COLLECTION:-listings}"
SEED_FILE="${SEED_FILE:-../backend/mongo-listing-seed.json}"

mongoimport \
  --uri "$MONGODB_URL" \
  --db "$MONGODB_DATABASE" \
  --collection "$MONGODB_COLLECTION" \
  --file "$SEED_FILE" \
  --jsonArray \
  --mode upsert \
  --upsertFields mongo_listing_id
