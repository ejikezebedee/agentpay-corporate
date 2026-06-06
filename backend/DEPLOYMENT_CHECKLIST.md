# AgentPay Backend Deployment Checklist

## Pre-Deployment

- Confirm backend host supports Node.js runtime, environment variables, HTTPS, persistent logs, and process restart.
- Confirm PostgreSQL is available and reachable from the backend host.
- Confirm MongoDB is available and reachable from the backend host.
- Confirm Redis or a durable queue is available before background reconciliation workers go live.
- Keep public website on Hostinger Cloud unless backend runtime is also confirmed stable there.

## Database

- Apply `migrations/202606050001_agentpay_initial_schema.sql`.
- Apply `migrations/202606050002_agentpay_visible_listing_seed.sql`.
- Import `mongo-listing-seed.json` into the MongoDB listing discovery collection.
- Run `backend-service` tests before connecting real repositories: `npm test`.
- Review `backend-service/docs/PRODUCTION_API_SERVER.md` before exposing `api.zebepay.com`.
- Verify all price fields are stored as `NUMERIC(36,18)` through `money_amount`.
- Verify every active PostgreSQL listing has `mongo_listing_id`, `schema_id`, `public_slug`, `requirements_schema`, `price`, and `currency`.

## Secrets

- Store secrets only in deployment secret manager or environment variables.
- Required secrets:
  - database URL
  - MongoDB URL
  - Redis URL
  - JWT/session secret
  - Binance Pay API key
  - Binance Pay secret key
  - Binance Pay certificate serial number
  - Binance Pay webhook public key
  - object storage keys
  - email provider key

## Security Gates

- Enforce HTTPS only.
- Verify Binance Pay webhook signatures.
- Verify signed agent requests before order creation.
- Enforce idempotency keys on deposits, payment requests, and orders.
- Hash API keys before storage.
- Keep audit logs for every financial and admin action.
- Rate-limit auth, webhook, order, and payment-request endpoints.
- Use decimal strings for API money amounts.
- Reject floats and malformed money strings at API boundary.

## Functional Smoke Tests

- User can sign up and create wallet.
- Agent can be registered with limits.
- Visible marketplace listings can be queried.
- Buyer agent can create a payment request.
- Order creation locks escrow and writes ledger entry.
- Delivery proof moves order to `delivered`.
- Release moves escrow to merchant and writes ledger entries.
- Refund returns escrow to buyer and writes ledger entry.
- Duplicate idempotency key returns existing result or conflict.
- Bad webhook signature is rejected.
- Bad agent request signature is rejected.
- Escrow release is impossible before delivery.
- Refund transitions create refund ledger effects.
- PostgreSQL escrow balance updates run inside one transaction with row locks.

## Production Hold

Do not enable live payment movement until legal/compliance review approves:

- KYC tiers and thresholds
- refund rules
- dispute rules
- transaction limits
- merchant onboarding rules
- audit-log retention
- fee disclosure
