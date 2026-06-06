# API Server Deployment Bundle

## Purpose

This bundle prepares AgentPay for deployment on a dedicated `api.zebepay.com` server. It does not activate live payments by itself.

## Bundle Contents

- `releases/agentpay-api-server-bundle.tar.gz` in the published package
- `.env.production.example`
- `Dockerfile`
- `docker-compose.example.yml`
- `infra/nginx/api.zebepay.com.conf`
- `infra/systemd/agentpay-api.service`
- `infra/deploy/provision-api-server.sh`
- `infra/deploy/verify-ssh-target.sh`
- `infra/deploy/apply-postgres-migrations.sh`
- `infra/deploy/import-mongo-seed.sh`
- `infra/deploy/smoke-api.sh`
- `infra/deploy/rollback-api-server.sh`
- `infra/scripts/healthcheck.sh`
- `infra/scripts/backup-databases.sh`
- `docs/PRODUCTION_LAUNCH_CONTROL.md`
- `docs/DNS_CUTOVER_RUNBOOK.md`

## Deployment Flow

1. Provision server and install runtime dependencies.
2. Verify the SSH target fingerprint with `infra/deploy/verify-ssh-target.sh`.
3. Upload backend-service release bundle.
4. Create `.env` from `.env.production.example`.
5. Apply PostgreSQL migrations.
6. Import MongoDB listing seed.
7. Start API via Docker Compose or systemd.
8. Configure Nginx and TLS.
9. Run smoke tests.
10. Complete `docs/PRODUCTION_LAUNCH_CONTROL.md` and `docs/DNS_CUTOVER_RUNBOOK.md`.
11. Keep payment movement disabled until compliance and Binance Pay credentials are approved.

## Rollback

Store every deployed release under a timestamped release folder. To roll back, set `ROLLBACK_RELEASE` and run `infra/deploy/rollback-api-server.sh`.

## Launch Gate

Do not point production traffic to this API until:

- TLS is active
- `/health` passes
- bad Binance Pay webhook signatures are rejected
- bad agent signatures are rejected
- PostgreSQL migrations are applied
- MongoDB discovery seed is imported
- Redis is reachable
- backups are tested
- logs are retained
- compliance approval is complete

## Target Verification Gate

Do not run provisioning scripts on a server with an unverified or changed SSH host key. Confirm the exact host, IP address, and fingerprint before deployment.
