#!/usr/bin/env sh
set -eu

TARGET_HOST="${TARGET_HOST:-api.zebepay.com}"
TARGET_PORT="${TARGET_PORT:-22}"
EXPECTED_HOST_KEY_SHA256="${EXPECTED_HOST_KEY_SHA256:-}"

if [ -z "$EXPECTED_HOST_KEY_SHA256" ]; then
  echo "Set EXPECTED_HOST_KEY_SHA256 to the trusted SHA256 host-key fingerprint before running."
  echo "Example value format: SHA256:abc123..."
  exit 2
fi

if ! command -v ssh-keyscan >/dev/null 2>&1; then
  echo "ssh-keyscan is required."
  exit 2
fi

if ! command -v ssh-keygen >/dev/null 2>&1; then
  echo "ssh-keygen is required."
  exit 2
fi

tmp_known_hosts="$(mktemp)"
trap 'rm -f "$tmp_known_hosts"' EXIT

echo "Scanning SSH host key for ${TARGET_HOST}:${TARGET_PORT}"
ssh-keyscan -p "$TARGET_PORT" "$TARGET_HOST" > "$tmp_known_hosts" 2>/dev/null

if [ ! -s "$tmp_known_hosts" ]; then
  echo "No SSH host key returned. Stop deployment."
  exit 1
fi

actual_fingerprints="$(ssh-keygen -lf "$tmp_known_hosts" | awk '{print $2}' | sort -u)"

echo "Returned fingerprints:"
echo "$actual_fingerprints"

if echo "$actual_fingerprints" | grep -Fx "$EXPECTED_HOST_KEY_SHA256" >/dev/null 2>&1; then
  echo "SSH target verified. Deployment may proceed to the next gate."
else
  echo "SSH target fingerprint mismatch. Stop deployment."
  exit 1
fi
