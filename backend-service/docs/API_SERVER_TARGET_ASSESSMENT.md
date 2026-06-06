# API Server Target Assessment

## Result

No dedicated API server target is currently verified for live provisioning.

## Findings

- `api.zebepay.com` resolves to Hostinger infrastructure, not a verified dedicated API server.
- Current Hostinger static hosting does not expose Node.js runtime over SSH.
- A prior server endpoint presented a changed SSH host key during inspection.
- The changed SSH host key was treated as a security stop condition.
- No host-key bypass, server provisioning, DNS change, service start, database connection, or secret activation was performed.

## Decision

Do not provision AgentPay API on any server until the target host is verified.

## Required Before Provisioning

- Confirm the exact API server provider and IP address.
- Confirm SSH host key fingerprint through a trusted channel.
- Confirm server ownership and intended use for AgentPay.
- Confirm whether Docker Compose or systemd deployment path should be used.
- Confirm DNS change authority for `api.zebepay.com`.
- Confirm production secrets are available from a secure secret manager.

## Safe Next Step

Provision a fresh dedicated API server or provide a verified existing server target. After that, use `releases/agentpay-api-server-bundle.tar.gz` and the deployment scripts in `backend-service/infra/deploy/`.
