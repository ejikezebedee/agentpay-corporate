# Dedicated API Server Provisioning Plan

## Objective

Provision `api.zebepay.com` separately from Hostinger static hosting so AgentPay can run a real backend with Node.js, PostgreSQL, MongoDB, Redis, HTTPS webhooks, audit logging, and backups.

## Recommended Stack

- Ubuntu LTS server
- Node.js 20+
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- Nginx reverse proxy
- Let's Encrypt TLS
- systemd or Docker Compose process management
- firewall allowing SSH, HTTP, and HTTPS only

## Included Templates

- `Dockerfile`
- `docker-compose.example.yml`
- `infra/nginx/api.zebepay.com.conf`
- `infra/systemd/agentpay-api.service`
- `infra/scripts/healthcheck.sh`
- `infra/scripts/backup-databases.sh`

## Provisioning Order

1. Create a dedicated server for `api.zebepay.com`.
2. Create a non-root `agentpay` user.
3. Install Node.js 20+, Nginx, PostgreSQL, MongoDB, Redis, and Certbot, or install Docker and Docker Compose.
4. Point `api.zebepay.com` DNS to the API server.
5. Upload `backend-service/` to `/opt/agentpay/backend-service`.
6. Create `.env` from `.env.example` using real secrets from the secret manager.
7. Apply PostgreSQL migrations from `../backend/migrations/`.
8. Import Mongo listing seed from `../backend/mongo-listing-seed.json`.
9. Install and enable either systemd service or Docker Compose.
10. Configure Nginx and issue TLS certificate.
11. Run health check.
12. Run route smoke tests.
13. Keep payment movement disabled until compliance and Binance Pay credentials are verified.

## Required Verification

- `GET /health` returns `ok: true`.
- `POST /api/v1/webhooks/binance-pay` rejects bad signatures.
- Order creation rejects bad agent signatures.
- PostgreSQL migrations are present.
- MongoDB listing seed is present.
- Redis is reachable.
- Database backups run.
- Logs are retained.

## Do Not Launch If

- no TLS certificate is active
- no database backups are configured
- API secrets are stored in source files
- Binance Pay webhook public key is missing
- compliance rules are not approved
- audit log retention is not approved
