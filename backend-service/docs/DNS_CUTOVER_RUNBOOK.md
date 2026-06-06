# DNS Cutover Runbook

## Purpose

This runbook controls the `api.zebepay.com` move from static hosting or placeholder routing to a verified dedicated API server.

## Before DNS Change

- Confirm `PRODUCTION_LAUNCH_CONTROL.md` pre-launch gates are complete.
- Confirm the API server public IP address.
- Confirm TLS can be issued for `api.zebepay.com`.
- Confirm rollback DNS target.
- Lower DNS TTL before cutover where the DNS provider supports it.
- Confirm no frontend code depends on an old API URL.

## Cutover Steps

1. Deploy the backend service release archive to the verified server.
2. Configure `.env` from `.env.production.example` on the server.
3. Apply PostgreSQL migrations.
4. Import MongoDB listing seed.
5. Start the API service.
6. Configure reverse proxy for `api.zebepay.com`.
7. Issue or attach TLS certificate.
8. Run smoke tests using `BASE_URL=https://api.zebepay.com`.
9. Update DNS `A` or `CNAME` record to the verified API server target.
10. Re-run smoke tests after DNS propagation begins.

## Post-Cutover Checks

- `https://api.zebepay.com/health` returns success.
- Listing endpoint returns expected JSON.
- Invalid webhook signatures return `401`.
- Invalid agent signatures return `401`.
- Application logs show normal requests only.
- Nginx logs show no repeated `5xx` errors.
- Frontend console can reach the API endpoint when connected.

## Rollback

Rollback if health checks fail, TLS fails, payment verification behaves incorrectly, or unexplained `5xx` errors continue.

1. Restore previous DNS record.
2. Run `infra/deploy/rollback-api-server.sh` if the previous API release should be restored.
3. Confirm `/health` on the restored route.
4. Leave payment movement disabled.
5. Record the incident and failed gate before retrying.

## DNS Decision Record

```text
DNS Cutover Record
Date:
DNS provider:
Previous record:
New record:
TTL:
Release archive:
Smoke result before DNS:
Smoke result after DNS:
Rollback target:
Operator:
Decision:
```
