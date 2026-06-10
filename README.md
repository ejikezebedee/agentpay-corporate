# Fully Functioning AgentPay Website

AgentPay is a fully functioning marketplace website package with an operational admin dashboard, backend-connected listings, protected sessions, internal messaging, dispute workflows, escrow-style wallet movements, audit events, and payment provider architecture for sandbox and Binance Pay top-up flows.

## Current Stack

- Frontend: static HTML, CSS, and JavaScript.
- Backend: plain Node.js HTTP server, no Express dependency.
- Data: clean repository/domain layer with a local in-memory adapter for development and PostgreSQL schema/migration files for durable hosted production.
- Tests: Node built-in test runner.

## Features Included

- Server-side admin dashboard lock for `/app`.
- Admin login/logout/session routes with HTTP-only cookie support.
- Responsive Marketplace Listing Dashboard.
- Listing create, edit, pause/activate, discount, archive, refresh, and export flows.
- Public marketplace listing API that excludes archived products.
- Dispute Management page with queue, case detail, messages, notes, evidence requests, escalation, close, refund, release, and partial refund.
- Internal Messages page for direct user messages, announcements, read/archive state, and message history.
- Ledger-based wallet/escrow movements with idempotency protection.
- Sandbox deposit lifecycle with pending deposits, mock provider checkout, webhook confirmation, duplicate protection, and audit events.
- PaymentProvider interface, MockSandboxProvider, and BinancePayProvider adapter.
- Audit events for auth, listing, dispute, wallet, message, contact, payment, and admin actions.
- Responsive dashboard layout for desktop, laptop, tablet, and mobile.

## Folder Structure

```text
agentpay/
  README.md
  .env.example
  package.json
  index.html
  app.html
  app.css
  app.js
  preview-server.mjs
  assets/
  backend-service/
    src/
    test/
    package.json
    schema.sql
  backend/
    schema.sql
    migrations/
    listing-schemas/
  docs/
    API.md
    RUNBOOK.md
    BRAND.md
  public/
    favicon.svg
```

## Environment Variables

Copy `.env.example` and set real values in your deployment environment. Local development can run with fallback credentials, but hosted production must provide:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `AGENTPAY_APP_ORIGIN`
- `AGENTPAY_BACKEND_ORIGIN`
- `BINANCE_PAY_API_KEY`
- `BINANCE_PAY_SECRET_KEY`
- `BINANCE_PAY_BASE_URL`
- `BINANCE_PAY_WEBHOOK_SECRET`

Generate an admin password hash:

```bash
node -e "const crypto=require('node:crypto');const password=process.argv[1];const salt=crypto.randomBytes(16).toString('base64url');crypto.pbkdf2(password,salt,310000,32,'sha256',(e,k)=>{if(e)throw e;console.log(`pbkdf2$310000$${salt}$${k.toString('base64url')}`)})" "your-password"
```

## Local Development

Open two terminals from the `agentpay/` folder.

Terminal 1:

```bash
npm run backend:start
```

Terminal 2:

```bash
npm run frontend:start
```

Then open:

```text
http://127.0.0.1:4173/app
```

## Admin Login

Local development fallback:

- Username: `admin@zebepay.test`
- Password: `admin-demo-pass`

For production-like testing, set `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET`.

## Marketplace Listing Dashboard

After login, use `/app` to:

- Add a new product.
- Edit listing fields.
- Apply percentage or fixed discounts.
- Pause/activate listings.
- Archive listings.
- Refresh from the backend listing API.
- Export listing JSON.

Listing routes are protected server-side and create audit events for listing changes.

## Public Marketplace

The public marketplace reads from:

```text
GET /api/public/listings
```

Archived listings are excluded from that public response.

## Sandbox Wallet Top-Up

Use:

```text
POST /api/v1/sandbox/deposits
POST /api/v1/webhooks/sandbox/deposits/:depositId/confirm
```

Deposits begin as `pending`. Wallet credit is created only after the mock webhook confirmation route succeeds. Duplicate webhook confirmation uses idempotency protection and does not double-credit the wallet.

## Dispute Management

Open the **Disputes** sidebar item to:

- View dispute queue and detail panel.
- Request buyer/seller evidence.
- Send dispute-related messages.
- Add internal admin notes.
- Mark under review, escalate, close.
- Refund buyer, release seller, or split with partial refund.

Money movement uses immutable ledger entries and idempotency keys.

## Internal Messaging

Open the **Messages** sidebar item to:

- Search users.
- Send direct messages.
- Send announcements to all users.
- Filter message history.
- Mark messages read.
- Archive messages.

This is internal in-app messaging. Email, SMS, WhatsApp, and push delivery can be added through provider integrations later.

## Tests

```bash
npm test
```

The package passes the backend test suite covering auth, listings, public marketplace listings, disputes, escrow, wallet ledger, money validation, messages, audit events, contact requests, responsive smoke checks, and payment provider behavior.

## Production Completion

- Configure PostgreSQL repositories from the included schema/migrations before hosted production traffic.
- Add durable object/file storage for product downloads and dispute evidence.
- Configure real notification providers if email, SMS, WhatsApp, or push delivery is required.
- Add Binance Pay credentials only through environment variables, then review production signing and webhook verification against the current official Binance Pay documentation.
- Complete production API-key hardening, CSRF controls, rate limits, observability, and durable sessions.

## Production Checklist

- Enable PostgreSQL-backed users, sessions, listings, wallets, ledger, disputes, messages, and audit events.
- Store secrets only in environment variables or a secret manager.
- Complete Binance Pay sandbox testing and webhook reconciliation before enabling real money movement.
- Keep all wallet/escrow changes ledger-based and idempotent.
- Add production file storage for digital goods and dispute evidence.
- Put the frontend behind HTTPS and enforce secure cookies.
