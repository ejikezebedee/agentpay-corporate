#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-https://api.zebepay.com}"

curl -fsS "$BASE_URL/health"
