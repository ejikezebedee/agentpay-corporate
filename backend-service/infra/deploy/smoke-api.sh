#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://api.zebepay.com}"

echo "Checking health"
curl -fsS "$BASE_URL/health"

echo
echo "Checking listings"
curl -fsS "$BASE_URL/api/v1/listings" | grep '"items"'

echo
echo "Checking bad webhook rejection"
if curl -fsS -X POST "$BASE_URL/api/v1/webhooks/binance-pay" -H "Content-Type: application/json" -d '{"status":"PAID"}'; then
  echo "Bad webhook was accepted unexpectedly"
  exit 1
else
  echo "Bad webhook rejected as expected"
fi
