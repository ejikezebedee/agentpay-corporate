# AgentPay MVP

AgentPay is an MVP backend dashboard and payment workflow starter for marketplace listings, admin-managed disputes, escrow-style wallet movements, audit events, and future crypto/Binance Pay top-up flows.

## Current Stack

- Frontend: static HTML, CSS, and JavaScript.
- Backend: plain Node.js HTTP server, no Express dependency.
- Data: in-memory repository for local MVP testing, with PostgreSQL-ready boundaries and SQL/schema files included.
- Tests: Node built-in test runner.

## Features Included

- Server-side admin dashboard lock for `/app`.
- Admin login/logout/session routes with HTTP-only cookie support.
- Responsive Marketplace Listing Dashboard.
- Listing create, edit, pause/activate, discount, archive, refresh, and export flows.
- Dispute Management page with queue, case detail, messages, notes, evidence requests, escalation, close, refund, release, and partial refund.
- Ledger-based wallet/escrow movements with idempotency protection.
- Audit events for auth, listing, dispute, wallet, message, and admin actions.
- Binance Pay webhook verification scaffold and tests; real production payments are not enabled.

## Folder Structure

```text
agentpay-corporate/
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
    docs/
    infra/
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

Copy `.env.example` and set real values in your deployment environment. This project does not require a `.env` file for local demo defaults, but production must provide:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `AGENTPAY_APP_ORIGIN`
- `AGENTPAY_BACKEND_ORIGIN`

Generate an admin password hash:

```bash
node -e "const crypto=require('node:crypto');const password=process.argv[1];const salt=crypto.randomBytes(16).toString('base64url');crypto.pbkdf2(password,salt,310000,32,'sha256',(e,k)=>{if(e)throw e;console.log(`pbkdf2$310000$${salt}$${k.toString('base64url')}`)})" "your-password"
```

## Local Development

Open two terminals from the `agentpay-corporate/` folder.

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

Local demo fallback:

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

Listing routes are protected server-side.

## Dispute Management

Open the **Disputes** sidebar item to:

- View dispute queue and detail panel.
- Request buyer/seller evidence.
- Send dispute-related messages.
- Add internal admin notes.
- Mark under review, escalate, close.
- Refund buyer, release seller, or split with partial refund.

Money movement uses immutable ledger entries and idempotency keys.

## Tests

```bash
npm test
```

The package currently passes the backend test suite covering auth, listings, disputes, escrow, wallet ledger, money validation, messages, audit events, and Binance webhook verification scaffold.

## Current Limitations

- Runtime state is still in-memory unless you wire PostgreSQL repositories.
- Uploaded evidence/files are placeholders only.
- The full standalone Messages dashboard is not production notification delivery.
- Real Binance Pay wallet top-up is not enabled.
- Production API-key hardening, CSRF, rate limits, observability, and durable sessions still need final implementation.

## Production Checklist

- Replace in-memory users, sessions, listings, wallets, ledger, disputes, messages, and audit events with PostgreSQL/durable storage.
- Store secrets only in environment variables or a secret manager.
- Complete Binance Pay sandbox testing and webhook reconciliation before enabling real money movement.
- Keep all wallet/escrow changes ledger-based and idempotent.
- Add production file storage for digital goods and dispute evidence.
- Put the frontend behind HTTPS and enforce secure cookies.
