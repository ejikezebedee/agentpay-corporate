# AgentPay Backend Service

This dependency-free Node.js API powers the AgentPay website. It provides protected sessions, listing management, internal messages, disputes, escrow settlement, wallet ledger entries, audit events, public marketplace listings, contact requests, sandbox deposits, and payment provider boundaries for Binance Pay deployment.

## Run Locally

```bash
npm test
npm start
```

The server listens on `PORT` or `3000`.

Copy `.env.example` to `.env` for local development. Keep real secrets in the deployment secret manager, not in source control.

## Implemented Routes

- `GET /health`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/public/listings`
- `POST /api/contact-requests`
- `GET /api/listings`
- `GET /api/listings/:id`
- `POST /api/listings`
- `PATCH /api/listings/:id`
- `PATCH /api/listings/:id/status`
- `PATCH /api/listings/:id/discount`
- `DELETE /api/listings/:id`
- `GET /api/users`
- `GET /api/messages`
- `GET /api/messages/:threadId`
- `POST /api/messages`
- `PATCH /api/messages/:id/read`
- `PATCH /api/messages/:id/archive`
- `POST /api/messages/announcement`
- `GET /api/disputes`
- `GET /api/disputes/:id`
- `POST /api/disputes`
- `PATCH /api/disputes/:id/status`
- `POST /api/disputes/:id/evidence`
- `POST /api/disputes/:id/message`
- `POST /api/disputes/:id/request-evidence`
- `POST /api/disputes/:id/refund`
- `POST /api/disputes/:id/release`
- `POST /api/disputes/:id/partial-refund`
- `POST /api/disputes/:id/close`
- `POST /api/disputes/:id/escalate`
- `POST /api/disputes/:id/admin-note`
- `GET /api/my/disputes`
- `GET /api/v1/listings`
- `GET /api/v1/session`
- `GET /api/v1/wallet/summary`
- `GET /api/v1/wallet/ledger`
- `POST /api/v1/sandbox/deposits`
- `POST /api/v1/sandbox/deposits/confirm`
- `POST /api/v1/orders`
- `POST /api/v1/orders/:orderId/:action`
- `POST /api/v1/webhooks/binance-pay`
- `GET /api/v1/admin/audit-events`
- `GET /api/v1/admin/review-queue`

## Domain And Auth Layer

The backend uses a clean domain/repository layer that can run in memory for local testing. That adapter is not durable storage. The repository boundary is intentionally separate so PostgreSQL can replace the local adapter for hosted production.

Implemented domain models:

- users and roles: `buyer`, `seller`, `admin`, `support`
- wallets and wallet accounts: `available`, `pending`, `escrow_locked`, `platform_fee`
- immutable ledger entries
- deposits
- listings
- escrow orders
- admin reviews
- audit events
- dispute cases and timeline records
- internal message threads

Protected routes require `Authorization: Bearer <session-token>` or the HTTP-only `agentpay_admin_session` cookie where applicable. Admin routes require an authenticated user with the `admin` role; buyer, seller, and support tokens are rejected from admin-only routes.

## Sandbox Wallet Top-Up Test Flow

Create a pending sandbox deposit as a buyer:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/sandbox/deposits \
  -H "Authorization: Bearer <buyer-session-token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: deposit-local-0001" \
  -d "{\"amount\":\"25.00\",\"currency\":\"USDT\"}"
```

Confirm the deposit through the mock webhook route as an admin or support user:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/sandbox/deposits/confirm \
  -H "Authorization: Bearer <admin-session-token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: webhook-local-0001" \
  -d "{\"deposit_id\":\"<deposit-id>\"}"
```

The first confirmation credits the wallet available account through an immutable ledger entry. Reusing the same webhook idempotency key returns the confirmed deposit without creating another ledger entry.

## Payment Providers

`src/payments.js` defines:

- `PaymentProvider`
- `MockSandboxProvider`
- `BinancePayProvider`
- `createPaymentProvider`

The mock provider is complete for local sandbox funding. The Binance adapter is credential-driven and intentionally reads credentials from environment variables only. TODO comments mark the exact places where production signing and webhook verification must be reviewed against the current official Binance Pay documentation before live money movement.

## Tests

```bash
npm test
```

The tests cover:

- admin and non-admin route access
- buyer wallet summary access
- pending sandbox deposit creation
- idempotent sandbox webhook confirmation
- immutable ledger reads
- negative balance rejection
- listing CRUD, discounts, status changes, and archive behavior
- public marketplace listing visibility
- dispute decision and settlement flows
- internal messaging and announcements
- contact request audit events
- payment provider behavior
- audit event creation

## Production Repository Pack

- `database/schema.sql` and `database/migrations/` define the PostgreSQL foundation.
- `src/repositories/postgresSettlementRepository.js` contains transaction-safe order, escrow, ledger, and audit-log repository flow.
- `src/repositories/sql/` contains PostgreSQL query modules that cast money through `money_amount`.
- `src/repositories/mongoListingRepository.js` contains the MongoDB listing discovery adapter.

## Implement Before Production Traffic

- Enable PostgreSQL-backed storage for users, sessions, listings, wallets, orders, ledger entries, deposits, disputes, messages, audit logs, and webhook records.
- Add durable file/object storage for digital products and dispute evidence.
- Replace local development credentials with environment-backed secrets.
- Complete Binance Pay sandbox testing and official production signature verification review.
- Add production API-key hashing, scoped permissions, CSRF controls, rate limits, structured logs, secure sessions, and observability.
- Use Redis or a durable queue for webhook, reconciliation, and delivery workers where needed.

## Non-Negotiable Money Rule

All API money values are decimal strings. Do not accept JavaScript numbers, floats, doubles, or scientific notation for money. PostgreSQL must store settlement values as `NUMERIC(36,18)` through the `money_amount` domain.
