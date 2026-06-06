# Production API Server Runbook

## Current Status

The backend-service is a production-wiring scaffold. It has strict money validation, signed starter agent requests, audit events, Binance Pay webhook verification, repository contracts, and transaction-safe PostgreSQL settlement queries. It is not activated as a live payment backend.

## Deployment Target Decision

Use Hostinger Node.js only if the plan supports:

- persistent Node.js process
- environment variables or secret manager
- outbound PostgreSQL, MongoDB, and Redis connectivity
- HTTPS webhook endpoint
- persistent logs
- process restart on failure

If any item is missing, deploy `backend-service/` to a dedicated API server or managed API host and point `api.zebepay.com` there.

Latest Hostinger inspection found no `node`, `npm`, `pm2`, or Passenger runtime available over SSH for the current Zebepay static hosting account. Treat dedicated API server deployment as the recommended path unless Hostinger enables a verified Node.js runtime separately.

## Production Wiring Order

1. Apply PostgreSQL migrations from `../backend/migrations/`.
2. Import Mongo discovery seed from `../backend/mongo-listing-seed.json`.
3. Create environment secrets from `.env.example`.
4. Connect PostgreSQL pool to `PostgresSettlementRepository`.
5. Connect MongoDB database to `MongoListingRepository`.
6. Keep Binance Pay webhook public key configured before enabling reconciliation.
7. Enable durable audit logging in PostgreSQL.
8. Add Redis-backed queue for webhook reconciliation and delivery workflows.
9. Run unit tests and route smoke tests.
10. Only then expose the API behind HTTPS.

## Launch Hold

Do not process live payment movement until:

- compliance and refund rules are approved
- KYC thresholds are approved
- Binance Pay webhook credentials are verified
- database backups are configured
- audit log retention is approved
- a rollback plan is documented
