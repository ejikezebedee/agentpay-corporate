# Security Remediation Pack

This pack records the Phase 28 security hardening pass completed after a defensive scan of the AgentPay package.

## Remediated Items

### Admin Audit Endpoint

`GET /api/v1/admin/audit-events` now uses the same HMAC authorization verifier as signed agent requests when `AGENTPAY_API_KEY_SECRET` is configured.

Development mode remains intentionally unsecured when no secret is configured, so buyers can still run the starter locally. Production deployments must set `AGENTPAY_API_KEY_SECRET`.

### Rollback Script Guardrails

`backend-service/infra/deploy/rollback-api-server.sh` now rejects unsafe rollback inputs:

- Empty rollback release names.
- Dot-prefixed rollback release names.
- Release names containing slashes.
- Release names containing `..`.
- `APP_DIR` values outside `/opt/agentpay/`.
- `APP_DIR=/` and `APP_DIR=/opt/agentpay`.

The rollback script still performs a destructive replacement of the app directory by design. Operators must review environment variables before running it.

### Frontend Demo Rendering

`app.js` now escapes interpolated values before rendering list templates. The console still uses `innerHTML` for static template markup, but dynamic values are HTML-escaped first.

This reduces XSS risk if demo arrays are later replaced with API-provided data.

## Remaining Production Requirements

Before production launch:

- Replace starter authorization with production auth and role checks.
- Protect admin routes with operator identity, session controls, and least privilege.
- Store secrets in server-side secret management.
- Add durable audit logging.
- Add request-size limits and rate limits.
- Review all deployment scripts before execution.
- Keep payment provider credentials out of frontend files.
- Complete security review before live transactions.

## Buyer Disclosure

The included backend is a starter. Phase 28 improves default safety posture, but it does not make AgentPay a production payment processor. Real payment workflows still require production authentication, database hardening, webhook reconciliation, security review, compliance review, and launch-control approval.

## Verification Checklist

- Admin audit endpoint has authorization gate when a secret is configured.
- Authorization tests cover missing headers and no-secret development mode.
- Rollback script rejects unsafe paths.
- Frontend template values are escaped before insertion.
- Backend tests pass.
- JavaScript syntax checks pass.
- JSON files parse cleanly.
- Release checksums are refreshed.
