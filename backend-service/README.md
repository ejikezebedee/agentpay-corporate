# AgentPay Backend Service Starter

This starter is a dependency-free Node.js API skeleton for the AgentPay MVP backend. It is designed to prove route shape, strict money validation, signed agent requests, idempotent order creation, escrow state transitions, audit events, and Binance Pay webhook signature verification before connecting real PostgreSQL, MongoDB, Redis, auth, or payment providers.

## Run Locally

```bash
npm test
npm start
```

The server listens on `PORT` or `3000`.

Copy `.env.example` to `.env` for local development. Keep real secrets in the deployment secret manager, not in source control.

## Implemented Starter Routes

- `GET /health`
- `GET /api/v1/listings`
- `POST /api/v1/orders`
- `POST /api/v1/orders/:orderId/:action`
- `POST /api/v1/webhooks/binance-pay`
- `GET /api/v1/admin/audit-events`

## Production Repository Pack

- `src/repositories/postgresSettlementRepository.js` contains transaction-safe order, escrow, ledger, and audit-log repository flow.
- `src/repositories/sql/` contains PostgreSQL query modules that cast money through `money_amount`.
- `src/repositories/mongoListingRepository.js` contains the MongoDB listing discovery adapter.
- `docs/PRODUCTION_API_SERVER.md` defines the deployment gate and API server wiring order.

## Dedicated API Server Pack

- `Dockerfile` and `docker-compose.example.yml` provide the container path.
- `infra/nginx/api.zebepay.com.conf` provides the reverse proxy template.
- `infra/systemd/agentpay-api.service` provides the direct Node.js service template.
- `infra/scripts/healthcheck.sh` verifies the public API health route.
- `infra/scripts/backup-databases.sh` provides starter database backup commands.
- `docs/API_SERVER_PROVISIONING_PLAN.md` defines the dedicated `api.zebepay.com` provisioning sequence.

## Deployment Bundle

- `.env.production.example` defines production environment variables without real secrets.
- `infra/deploy/` includes target-server scripts for provisioning, migrations, MongoDB seed import, smoke testing, and rollback.
- `docs/API_SERVER_DEPLOYMENT_BUNDLE.md` explains the release flow and launch gate.

## Implement Before Production

- Replace in-memory storage with PostgreSQL repositories for users, wallets, orders, ledger entries, deposits, disputes, audit logs, and listing settlement records.
- Replace listing catalog loading with MongoDB discovery reads plus PostgreSQL settlement joins.
- Replace starter HMAC auth with production API-key hashing, scoped permissions, rate limits, structured logs, and secure sessions.
- Keep Binance Pay webhook signature verification enabled before reconciliation.
- Use Redis or a durable queue for webhook, reconciliation, and delivery workers.

## Non-Negotiable Money Rule

All API money values are decimal strings. Do not accept JavaScript numbers, floats, doubles, or scientific notation for money. PostgreSQL must store settlement values as `NUMERIC(36,18)` through the `money_amount` domain.
