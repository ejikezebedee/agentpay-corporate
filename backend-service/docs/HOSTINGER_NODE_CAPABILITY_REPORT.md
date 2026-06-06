# Hostinger Node.js Capability Report

## Result

Hostinger static hosting is suitable for the Zebepay public website and static MVP console. It is not currently verified as suitable for the live AgentPay backend API.

## Checked

- SSH access to the Zebepay hosting account works.
- Zebepay document root is available at the domain `public_html` folder.
- The account contains the expected public website files.
- `node` was not available over SSH.
- `npm` was not available over SSH.
- `pm2` was not available over SSH.
- `passenger-config` was not available over SSH.
- `api.zebepay.com` has DNS present, but no backend health endpoint was verified.

## Decision

Do not activate the AgentPay backend on the current Hostinger static hosting route.

Recommended production split:

- `zebepay.com`: keep on Hostinger for static website, docs, package previews, and MVP console.
- `api.zebepay.com`: deploy to a dedicated API server or managed API host with Node.js, PostgreSQL, MongoDB, Redis, HTTPS, logs, backups, and secret management.

## Required API Server Capabilities

- Node.js 20 or later
- environment variables / secret manager
- PostgreSQL 15 or later
- MongoDB
- Redis or durable queue
- HTTPS ingress for webhooks
- persistent process manager
- structured logs
- database backups
- firewall and least-privilege SSH access

## Production Hold

Do not move real money or accept live buyer-agent orders until the dedicated API server is provisioned, secrets are configured, database migrations are applied, and Binance Pay webhook verification is tested with real provider credentials.
