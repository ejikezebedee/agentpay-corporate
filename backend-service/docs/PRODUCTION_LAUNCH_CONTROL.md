# Production Launch Control

## Purpose

This document is the go/no-go control layer for moving AgentPay from a static product package to a live API-backed production system.

It does not authorize payment activation by itself. It defines the checks required before production traffic, payment credentials, user data, or DNS cutover are enabled.

## Launch Roles

- Business owner: approves commercial launch and payment activation.
- Technical operator: verifies server, deploys release, and runs smoke tests.
- Security reviewer: confirms SSH target, secrets handling, webhook rejection, and log retention.
- Compliance reviewer: confirms terms, privacy policy, payment disclosures, and jurisdiction requirements.

## Hard Stop Conditions

Stop launch if any item below is true:

- API server ownership is not verified.
- SSH host-key fingerprint does not match a trusted fingerprint.
- Production secrets are stored in repository files.
- TLS is missing or invalid.
- `/health` fails from the public internet.
- Invalid Binance Pay webhook signatures are accepted.
- Invalid agent signatures are accepted.
- PostgreSQL migrations have not been applied.
- MongoDB listing seed has not been imported.
- Redis is not reachable when rate limits or idempotency depend on it.
- Database backups have not been tested.
- Rollback release path has not been tested.
- Terms, privacy, or payment compliance approval is missing.

## Pre-Launch Gates

### 1. Target Trust

- Confirm provider account ownership.
- Confirm server IP address.
- Confirm SSH username and port.
- Confirm trusted SSH host-key fingerprint out of band.
- Run `infra/deploy/verify-ssh-target.sh` with `EXPECTED_HOST_KEY_SHA256` set.

### 2. Runtime Readiness

- Node.js 20 or newer available.
- PostgreSQL available and restricted to trusted access.
- MongoDB available and restricted to trusted access.
- Redis available and restricted to trusted access.
- Nginx or equivalent reverse proxy configured.
- Certbot or managed TLS configured.
- Systemd or Docker Compose deployment path selected.

### 3. Secrets Readiness

- `.env` created on the server only.
- No production secret copied into documentation or source files.
- API signing secret generated.
- Binance Pay webhook public key configured.
- Database credentials stored with least privilege.
- Backup credentials stored outside the release archive.

### 4. Data Readiness

- PostgreSQL migrations applied from `backend/migrations/`.
- MongoDB seed imported from `backend/mongo-listing-seed.json`.
- Decimal money values verified as strings at API boundary.
- Escrow ledger records verified in PostgreSQL, not MongoDB.

### 5. Traffic Readiness

- `/health` returns success.
- Listing endpoint returns seeded catalog data.
- Bad Binance Pay webhook is rejected.
- Bad agent order request is rejected.
- Nginx access and error logs are retained.
- Application logs are retained.
- Backup script has completed once.

## Go/No-Go Decision

Use this decision format:

```text
AgentPay Production Launch Decision
Date:
Release archive:
API target:
SSH fingerprint verified: yes/no
TLS verified: yes/no
Smoke tests passed: yes/no
Rollback tested: yes/no
Compliance approved: yes/no
Payment activation approved: yes/no
Decision: go/no-go
Approver:
```

## Payment Activation Rule

Keep real payment movement disabled until the business owner, technical operator, security reviewer, and compliance reviewer all approve launch. A successful API deployment alone is not payment approval.
