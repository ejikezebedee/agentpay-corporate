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
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
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

## Stage 1 Domain and Auth Layer

Stage 1 keeps the current dependency-free Node.js backend and introduces a clean domain/repository layer that runs in memory for local MVP testing. It is not durable storage. The repository boundary is intentionally separate so PostgreSQL can replace the in-memory implementation later.

Implemented domain models:

- users and roles: `buyer`, `seller`, `admin`, `support`
- wallets and wallet accounts: `available`, `pending`, `escrow_locked`, `platform_fee`
- immutable ledger entries
- deposits
- listings
- escrow orders
- admin reviews
- audit events

Protected routes require `Authorization: Bearer <session-token>`. Admin routes require an authenticated user with the `admin` role; buyer, seller, and support tokens are rejected from admin-only routes.

Admin login for the local console remains available at `POST /api/v1/admin/login`. It returns a role-bearing session token for admin routes.

Stage A adds the server-side dashboard lock used by the static preview server. `/app` is not served unless the request includes a valid HTTP-only `agentpay_admin_session` cookie. The login page posts to `POST /api/auth/login`, which verifies a PBKDF2 password hash and issues the cookie plus a role-bearing token for API clients.

Required local environment variables for production-like testing:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `AGENTPAY_ADMIN_EMAIL`
- `AGENTPAY_ADMIN_PASSWORD`
- `AGENTPAY_ADMIN_TOKEN_SECRET`
- `AGENTPAY_SESSION_TOKEN_SECRET`

Use generated values for token secrets outside local development. Do not expose these values to frontend code. The local development username is `admin@zebepay.test`; the repository stores only a PBKDF2 hash fallback for the demo password. In production, set `ADMIN_PASSWORD_HASH` and do not rely on defaults.

## Sandbox Wallet Top-Up Test Flow

Create a pending sandbox deposit as a buyer:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/sandbox/deposits \
  -H "Authorization: Bearer <buyer-session-token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: deposit-demo-0001" \
  -d "{\"amount\":\"25.00\",\"currency\":\"USDT\"}"
```

Confirm the deposit through the mock webhook route as an admin or support user:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/sandbox/deposits/confirm \
  -H "Authorization: Bearer <admin-session-token>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: webhook-demo-0001" \
  -d "{\"deposit_id\":\"<deposit-id>\"}"
```

The first confirmation credits the wallet available account through an immutable ledger entry. Reusing the same webhook idempotency key returns the confirmed deposit without creating another ledger entry.

## Stage 1 Tests

```bash
npm test
```

The Stage 1 tests cover:

- non-admin rejection from admin routes
- buyer wallet summary access
- pending sandbox deposit creation
- idempotent sandbox webhook confirmation
- immutable ledger reads
- negative balance rejection
- audit event creation

## Listing Management Routes

The seller/admin listing dashboard uses these protected routes:

- `GET /api/listings` returns non-archived listings for the authenticated seller, or all non-archived listings for admins.
- `GET /api/listings/:id` returns one owned/admin-visible listing.
- `POST /api/listings` creates a listing after validating title, description, category, product type, price, discount, stock, delivery fields, and status.
- `PATCH /api/listings/:id` updates editable listing fields, recalculates final price, and audits status or discount changes.
- `PATCH /api/listings/:id/status` changes listing status.
- `PATCH /api/listings/:id/discount` adds, updates, or removes listing discounts.
- `DELETE /api/listings/:id` soft-deletes by setting status to `archived`; it does not hard-delete records.

Server-side validation rejects discounts that make final price zero or negative. Listing audit actions include `listing_created`, `listing_updated`, `listing_archived`, `listing_discount_added`, `listing_discount_removed`, and `listing_status_changed`.

## Dispute Management Routes

Stage B adds admin/support dispute management connected to escrow and wallet ledger primitives.

- `GET /api/disputes` lists all disputes for admin/support.
- `GET /api/disputes/:id` opens a dispute detail record with evidence and timeline.
- `PATCH /api/disputes/:id/status` moves controlled dispute statuses such as `under_review`.
- `POST /api/disputes/:id/request-evidence` requests buyer or seller evidence.
- `POST /api/disputes/:id/message` sends an internal dispute message with `related_entity_type = dispute`.
- `POST /api/disputes/:id/admin-note` adds an internal note.
- `POST /api/disputes/:id/refund` moves locked escrow funds back to the buyer available wallet through ledger entries.
- `POST /api/disputes/:id/release` moves locked escrow funds to the seller available wallet through ledger entries.
- `POST /api/disputes/:id/partial-refund` splits locked escrow between buyer refund and seller release.
- `POST /api/disputes/:id/escalate` and `POST /api/disputes/:id/close` update case status.

Resolution routes require an `Idempotency-Key` header. Duplicate resolution keys do not double-move funds. Resolved or closed disputes reject further money movement.

Dispute audit actions include `dispute_opened`, `dispute_viewed`, `dispute_status_changed`, `dispute_evidence_added`, `dispute_message_sent`, `dispute_evidence_requested`, `dispute_admin_note_added`, `dispute_escalated`, `dispute_refund_issued`, `dispute_escrow_released`, `dispute_partial_refund_issued`, `dispute_closed`, `duplicate_dispute_resolution_rejected`, and `unauthorized_dispute_access_rejected`.

## Internal Messaging Routes

The owner/admin messaging dashboard is internal only. It does not send email, SMS, WhatsApp, or external notifications yet.

- `GET /api/users` lists users for admin/support recipient search.
- `GET /api/messages` lists visible messages for the authenticated user.
- `GET /api/messages/:threadId` returns a thread when the user participates in it, or when the user is admin/support.
- `POST /api/messages` sends a direct internal message. Stage 1 allows admin/support direct sends.
- `PATCH /api/messages/:id/read` marks a visible message as read.
- `PATCH /api/messages/:id/archive` archives a visible message.
- `POST /api/messages/announcement` sends an internal announcement to all users except the sender.

Message validation rejects empty subjects or bodies and enforces subject/body length limits. A basic in-memory rate-limit placeholder is present for future anti-spam enforcement. TODO: add durable delivery queues and optional email notification integration.

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
