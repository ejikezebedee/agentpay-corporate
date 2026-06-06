#!/usr/bin/env sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root on the dedicated API server."
  exit 1
fi

APP_DIR="${APP_DIR:-/opt/agentpay/backend-service}"
APP_USER="${APP_USER:-agentpay}"

id "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$(dirname "$APP_DIR")"

echo "Install Node.js 20+, PostgreSQL, MongoDB, Redis, Nginx, and Certbot before enabling service."
echo "Upload backend-service files into $APP_DIR, then configure .env from .env.production.example."
