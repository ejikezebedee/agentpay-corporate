# AgentPay Runbook

## Start Backend

From the package root:

```bash
npm run backend:start
```

The backend listens on:

```text
http://127.0.0.1:3000
```

Health check:

```bash
curl http://127.0.0.1:3000/health
```

## Start Frontend

In a second terminal:

```bash
npm run frontend:start
```

Open:

```text
http://127.0.0.1:4173/app
```

The preview server protects `/app` with the backend-issued admin session cookie.

## Admin Password Hash

Generate a PBKDF2 hash:

```bash
node -e "const crypto=require('node:crypto');const password=process.argv[1];const salt=crypto.randomBytes(16).toString('base64url');crypto.pbkdf2(password,salt,310000,32,'sha256',(e,k)=>{if(e)throw e;console.log(`pbkdf2$310000$${salt}$${k.toString('base64url')}`)})" "your-password"
```

Set:

```env
ADMIN_USERNAME=your-admin-login
ADMIN_PASSWORD_HASH=pbkdf2$310000$...
ADMIN_SESSION_SECRET=long-random-secret
```

Do not store real secrets in source control.

## Run Tests

```bash
npm test
```

Or directly:

```bash
npm --prefix backend test
```

## Reset Local In-Memory State

Restart the backend process. The in-memory repository seeds users, wallets, listings, escrow order, dispute, messages, and audit records on server creation.

## Test Listing Dashboard

1. Start backend and frontend.
2. Open `/app`.
3. Log in.
4. Click **Add New Product**.
5. Enter title, description, category, type, price, discount, stock/status, and save.
6. Use **Pause / Activate**, **Add Discount**, **Delete**, **Sync / Refresh**, and **Export Listings**.

Expected: actions call backend routes, update the UI, and create audit events.

## Test Dispute Management

1. Open `/app`.
2. Log in.
3. Open **Disputes**.
4. Select the seeded dispute.
5. Try **Mark under review**, **Request buyer evidence**, **Send Dispute Message**, **Add Admin Note**.
6. Test one resolution action with an idempotency key through the UI or API.

Expected: dispute status/timeline updates, messages attach to the dispute, and wallet movement uses ledger entries.

## Troubleshooting

- If `/app` shows login again, the admin session cookie expired or was cleared.
- If listing/dispute API calls fail with 401, log out and log back in.
- If ports are already used, set `PORT` for backend or `PORT=4174` for the preview server.
- If frontend points at the wrong backend, set `AGENTPAY_BACKEND_ORIGIN`.
- If dashboard layout looks stale, clear browser cache or check the script query version in `frontend/app.html`.

## Production Safety Notes

- Current MVP runtime state is in-memory until PostgreSQL repositories are wired.
- Do not enable real payments until Binance Pay sandbox/webhook reconciliation is complete.
- Never credit a wallet before confirmed payment/webhook success.
- Keep wallet and escrow movement ledger-based and idempotent.
- Use environment variables or a secret manager for all secrets.
