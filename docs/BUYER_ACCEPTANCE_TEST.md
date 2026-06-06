# Buyer Acceptance Test

Use this checklist before delivering AgentPay to a buyer, client, marketplace, or internal stakeholder.

## Test 1: Archive Integrity

Steps:

1. Place `agentpay-corporate.zip` and `agentpay-corporate.zip.sha256` in the same folder.
2. Run `sha256sum -c agentpay-corporate.zip.sha256`.

Pass condition:

- The output says `agentpay-corporate.zip: OK`.

## Test 2: Required Files

Confirm the unzipped package includes:

- `index.html`
- `app.html`
- `README.md`
- `RELEASE_AUDIT.md`
- `RELEASE_MANIFEST.md`
- `RELEASE_SHA256SUMS.txt`
- `docs/BUYER_QUICKSTART.md`
- `docs/BUYER_VERIFICATION_GUIDE.md`
- `docs/SUPPORT_AND_REFUND_POLICY.md`
- `docs/CUSTOMIZATION_WORKBOOK.md`
- `docs/MARKETPLACE_UPLOAD_PACK.md`
- `backend/openapi.yaml`
- `backend/migrations/`
- `backend-service/package.json`
- `backend-service/test/`
- `releases/agentpay-api-server-bundle.tar.gz`

Pass condition:

- All required files and folders are present.

## Test 3: Public Website Preview

Steps:

1. Open `index.html` in a browser.
2. Confirm the homepage loads.
3. Open `pricing.html`, `marketplace.html`, `developers.html`, and `trust.html`.

Pass condition:

- Pages load without a build step and visible navigation works.

## Test 4: Console Preview

Steps:

1. Open `app.html`.
2. Open `app.html?view=marketplace`.
3. Open `app.html?view=sandbox`.
4. Open `app.html?view=escrow`.
5. Open `app.html?view=admin`.

Pass condition:

- Console views render and the view-specific content is visible, including the sandbox wallet and buyer-agent flow.

## Test 5: Backend Starter Tests

Steps:

1. Install Node.js 20 or newer.
2. Go to `backend-service/`.
3. Run `npm test`.

Pass condition:

- The test runner reports `# tests 19`, `# pass 19`, and `# fail 0`.

## Test 6: Flagship Listing Discovery

Steps:

1. Start the backend service from `backend-service/`.
2. Open `/api/v1/listings/agentpay-corporate/schema`.
3. Open `/api/v1/sandbox/client-environment`.

Pass condition:

- The schema route returns company registration, buyer-agent Ed25519 public key, target deployment, delivery contact, and launch-control requirements.
- The sandbox route returns test wallet state, the 5,000 USDT flagship listing, schema URL, buyer-agent flow, escrow trigger, and launch gate.

## Test 7: Release Checksum File

Steps:

1. Go to the unzipped package folder.
2. Run `sha256sum -c RELEASE_SHA256SUMS.txt`.

Pass condition:

- All listed release assets return `OK`.

## Test 8: Documentation Readiness

Review:

- `README.md`
- `docs/BUYER_QUICKSTART.md`
- `docs/GUMROAD_SALES_PAGE.md`
- `docs/MARKETPLACE_UPLOAD_PACK.md`
- `docs/LICENSE_AND_USAGE.md`
- `docs/SUPPORT_AND_REFUND_POLICY.md`
- `docs/FINAL_RELEASE_CHECKLIST.md`

Pass condition:

- Buyer setup, sales copy, license limits, support scope, refund expectations, and production limitations are clear.

## Test 9: Production Boundary

Confirm the package does not claim to be:

- A licensed financial product.
- A live payment processor out of the box.
- Legal, tax, financial, or compliance advice.
- A replacement for secure production infrastructure.

Pass condition:

- Production payment limitations are visible in buyer-facing documents.

## Acceptance Result

The package is accepted for commercial handoff when all tests pass and any customized brand, contact, pricing, legal, and support details have been reviewed.
