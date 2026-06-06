# Hostinger Cloud Deployment Guide

## Best Current Deployment

Deploy AgentPay as a static corporate website plus MVP console preview on Hostinger Cloud Hosting.

## Upload Method

1. Open Hostinger hPanel.
2. Select the domain for AgentPay.
3. Open File Manager.
4. Go to `public_html`.
5. Upload all files from this folder, including `app.html`, `app.css`, `app.js`, `assets/`, `backend/`, `backend-service/`, and `docs/`.
6. Confirm `index.html` is directly inside `public_html`.
7. Enable SSL for the domain.
8. Open the public domain and verify every section.
9. Open `/app` and verify the MVP console navigation.

## Git Method

1. Push this folder to a Git repository.
2. In Hostinger hPanel, open Git deployment.
3. Connect the repository and branch.
4. Set the deployment directory to the domain root.
5. Deploy and verify.

## Backend Note

The static website and console preview can live on Hostinger Cloud. The full AgentPay backend should use Hostinger Node.js only if the plan supports the required runtime, environment variables, PostgreSQL connection, Redis/background workers, HTTPS webhooks, and persistent logs. Otherwise use a dedicated API server or managed backend services when implementing:

- PostgreSQL ledger database
- Redis queues
- Binance Pay webhook processor
- Escrow state machine
- Admin dashboard
- Seller publishing backend
- Agent API authentication

See `docs/HOSTINGER_PHASE2_DEPLOYMENT.md` for the Phase 2 deployment gate.

`backend-service/` can be uploaded with the static package as source documentation and a runnable starter. Do not expose it as a live money-moving backend until production databases, authentication, audit logging, webhook verification, and compliance gates are connected.

Recommended production split:

- `zebepay.com` on Hostinger Cloud for public website and frontend console
- `api.zebepay.com` on a dedicated API server or managed backend for API, wallet, escrow, and webhooks
