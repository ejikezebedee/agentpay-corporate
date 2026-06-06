# Launch Execution Run Sheet

Use this sheet when the AgentPay Enterprise Node Deployment Package is ready to publish, test, and track.

## Launch Control

| Field | Value |
| --- | --- |
| Offer | AgentPay Enterprise Node Deployment Package |
| Price | 5,000 USDT |
| Buyer archive | `agentpay-corporate.zip` |
| Checksum file | `agentpay-corporate.zip.sha256` |
| Seller packet | `docs/SELLER_PUBLISHING_PACKET.md` |
| Upload pack | `docs/MARKETPLACE_UPLOAD_PACK.md` |
| Support policy | `docs/SUPPORT_AND_REFUND_POLICY.md` |
| Production gate | No live USDT, custody, production escrow, or automated archive transport without deployment approval |

## Pre-Publish Gate

- [ ] Archive checksum passes with `sha256sum -c agentpay-corporate.zip.sha256`.
- [ ] ZIP integrity passes with `unzip -t agentpay-corporate.zip`.
- [ ] Backend tests pass with `npm test` in `backend-service/`.
- [ ] Listing title matches seller packet.
- [ ] Price is set to `5,000 USDT`.
- [ ] Screenshot gallery is attached.
- [ ] Schema route is visible: `/api/v1/listings/agentpay-corporate/schema`.
- [ ] Sandbox route is visible: `/api/v1/sandbox/client-environment`.
- [ ] Production boundary is visible.
- [ ] License, refund, and support boundaries are visible.

## Publication Record

Fill this after the listing is created.

| Field | Record |
| --- | --- |
| Marketplace/platform | |
| Listing URL | |
| Publish date | |
| Uploaded archive checksum | |
| Screenshots attached | |
| Delivery note included | |
| Test purchase available | |
| Test purchase result | |
| Notes | |

## Buyer-Agent Smoke Test

Use this sequence for a sandbox buyer-agent check.

1. Read listing catalog.
2. Read `/api/v1/listings/agentpay-corporate/schema`.
3. Read `/api/v1/sandbox/client-environment`.
4. Create sandbox order request with idempotency key.
5. Approve order in starter state machine.
6. Lock escrow in starter state machine.
7. Confirm delivery proof reports archive delivery readiness.

Expected result:

- Schema returns required buyer-agent inputs.
- Sandbox route returns test wallet, listing, schema URL, escrow trigger, and launch gate.
- Escrow lock attaches delivery artifact metadata.
- No live funds move.

## Sales Tracker

| Date | Channel | Prospect/buyer | Stage | Use case | Risk | Next action | Due date | Revenue opportunity |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | Marketplace | | Lead | Enterprise node deployment | | Send seller packet and disclosure | | 5,000 USDT package |

Stages:

- Lead
- Interested
- Purchased
- Activated
- Upsell qualified
- Support risk
- Retained

## First Response Templates

### Inquiry

```text
AgentPay Enterprise Node Deployment Package is a 5,000 USDT commercial deployment asset stack for agentic commerce, wallet, marketplace, escrow, and buyer-agent workflow planning. It includes the verified archive, checksum, schema route, sandbox route, backend starter, docs, and launch-control boundaries. It is not a live payment processor until production approval gates are completed.
```

### Buyer Activation

```text
Start with README.md, docs/BUYER_QUICKSTART.md, and docs/BUYER_VERIFICATION_GUIDE.md. Then open app.html?view=sandbox and inspect /api/v1/listings/agentpay-corporate/schema plus /api/v1/sandbox/client-environment in the backend starter.
```

### Upsell

```text
If you want AgentPay adapted for a specific brand, client, pilot, or production roadmap, use docs/CUSTOMIZATION_WORKBOOK.md and docs/IMPLEMENTATION_SCOPE_PACK.md to scope a paid implementation-planning engagement. Live payment processing, compliance review, secure infrastructure, and custom backend engineering are separately scoped.
```

## Daily Launch Review

- [ ] New listing views checked.
- [ ] New inquiries logged.
- [ ] Buyer activation status checked.
- [ ] Support or refund risks logged.
- [ ] Upsell requests routed to implementation scope.
- [ ] Any payment/compliance expectation corrected.
- [ ] Archive checksum preserved.
- [ ] No production payment activation performed without approval.
