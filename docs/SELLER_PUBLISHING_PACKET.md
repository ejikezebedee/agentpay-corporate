# Seller Publishing Packet

Use this packet when publishing the Phase 42 AgentPay archive as a live marketplace offer.

## Primary Offer

Title:

```text
AgentPay Enterprise Node Deployment Package
```

Price:

```text
5,000 USDT
```

Positioning:

```text
Enterprise-grade AgentPay deployment asset stack for founders, agencies, and operators who need a polished agentic commerce website, clickable console, marketplace listing schema, backend starter, launch-control runbooks, and buyer-agent intake flow.
```

## Delivery Payload

Upload or attach:

- `agentpay-corporate.zip`
- `agentpay-corporate.zip.sha256`
- Screenshot gallery from `docs/screenshots/`
- Buyer quickstart: `docs/BUYER_QUICKSTART.md`
- Buyer verification guide: `docs/BUYER_VERIFICATION_GUIDE.md`
- Release manifest: `RELEASE_MANIFEST.md`
- Final checklist: `docs/FINAL_RELEASE_CHECKLIST.md`

## Buyer-Agent Discovery

Expose these backend starter routes in the listing copy or developer notes:

- `GET /api/v1/listings/agentpay-corporate/schema`
- `GET /api/v1/sandbox/client-environment`

The schema route defines buyer company registration, Ed25519 buyer-agent public key, target deployment details, delivery contact, and launch-control acknowledgements.

The sandbox route exposes test wallet state, flagship listing metadata, schema URL, buyer-agent flow, escrow trigger, and launch gate.

## Delivery Proof Language

Use this delivery wording:

```text
Delivery includes the verified AgentPay Phase 42 buyer archive and SHA256 checksum. The archive contains the public site, MVP console, backend starter, schemas, OpenAPI route map, sandbox client-environment route, launch-control docs, and commercial buyer handoff packs. Automated production archive transport and live USDT settlement remain gated until separate deployment approval.
```

## Upload Checklist

- [ ] `agentpay-corporate.zip` uploaded.
- [ ] `agentpay-corporate.zip.sha256` uploaded or displayed.
- [ ] SHA256 value copied exactly from the checksum file.
- [ ] Screenshot gallery attached in the recommended order.
- [ ] Price set to `5,000 USDT` for the enterprise node deployment package.
- [ ] Schema route shown in developer notes.
- [ ] Sandbox route shown in developer notes.
- [ ] Refund/support policy linked or pasted.
- [ ] License and redistribution boundary visible.
- [ ] Production payment boundary visible.
- [ ] No live payment, custody, escrow, or archive transport claim made without deployment approval.

## Pre-Publish Verification

Run before upload:

```bash
sha256sum -c agentpay-corporate.zip.sha256
unzip -t agentpay-corporate.zip
cd agentpay-corporate/backend-service
npm test
```

Expected results:

- `agentpay-corporate.zip: OK`
- ZIP test reports no compressed-data errors.
- Backend test runner reports `# tests 19`, `# pass 19`, and `# fail 0`.

## Production Boundary

Do not state or imply that the package is a live payment processor. It is a commercial deployment asset stack and MVP foundation. Real USDT movement, custody, production escrow, payment-provider activation, and automated archive delivery require legal, compliance, security, infrastructure, database, and launch-control review.
