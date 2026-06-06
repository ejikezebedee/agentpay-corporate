# Hostinger Phase 2 Deployment Notes

## Static Frontend Deployment

Upload these files and folders to the Hostinger site document root:

- `index.html`
- `styles.css`
- `script.js`
- `app.html`
- `app.css`
- `app.js`
- `assets/`

The public website opens at `/`.
The product console preview opens at `/app`.

## Live Backend Deployment

Before live wallet or escrow transactions, confirm the hosting environment supports:

- Node.js runtime for backend API
- environment variables / secret manager
- PostgreSQL connection
- Redis or background worker support
- HTTPS webhook URL for Binance Pay
- persistent logs
- file upload storage
- scheduled reconciliation jobs

If any item is missing, deploy the backend on a dedicated API server or managed API host and keep Hostinger Cloud for the website/frontend.

## Required Production Secrets

Do not place secrets inside frontend files.

Required backend secrets:

- database URL
- JWT/session secret
- Binance Pay API key
- Binance Pay secret key
- Binance Pay certificate serial number
- Binance Pay webhook public key
- email provider API key
- object storage keys

## Launch Gate

Do not enable live payments until:

- Binance Pay webhook signature verification is implemented
- ledger debit and credit entries are transaction-safe
- idempotency keys are enforced
- admin audit logs are immutable
- refund and dispute rules are documented
- legal/compliance review is complete
