#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/agentpay/backend-service}"
RELEASES_DIR="${RELEASES_DIR:-/opt/agentpay/releases}"
ROLLBACK_RELEASE="${ROLLBACK_RELEASE:?Set ROLLBACK_RELEASE to a release directory under /opt/agentpay/releases}"

case "$ROLLBACK_RELEASE" in
  ""|.*|*/*|*..*)
    echo "Invalid ROLLBACK_RELEASE. Use a release directory name only."
    exit 1
    ;;
esac

case "$APP_DIR" in
  /opt/agentpay/*) ;;
  *)
    echo "Refusing to remove APP_DIR outside /opt/agentpay: $APP_DIR"
    exit 1
    ;;
esac

if [ "$APP_DIR" = "/opt/agentpay" ] || [ "$APP_DIR" = "/" ]; then
  echo "Refusing unsafe APP_DIR: $APP_DIR"
  exit 1
fi

ROLLBACK_DIR="$RELEASES_DIR/$ROLLBACK_RELEASE"

if [ ! -d "$ROLLBACK_DIR" ]; then
  echo "Release not found: $RELEASES_DIR/$ROLLBACK_RELEASE"
  exit 1
fi

systemctl stop agentpay-api || true
rm -rf "$APP_DIR"
cp -a "$ROLLBACK_DIR" "$APP_DIR"
chown -R agentpay:agentpay "$APP_DIR"
systemctl start agentpay-api
systemctl status agentpay-api --no-pager
