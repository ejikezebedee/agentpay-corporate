# Buyer Verification Guide

Use this guide after downloading `agentpay-corporate.zip` to confirm the package is complete, portable, and safe to inspect before deployment.

## 1. Verify Archive Integrity

From the folder containing the ZIP:

```bash
sha256sum -c agentpay-corporate.zip.sha256
```

Expected result:

```text
agentpay-corporate.zip: OK
```

If your system does not support `sha256sum`, compare the archive hash manually with the value in `agentpay-corporate.zip.sha256`.

## 2. Inspect Package Contents

Unzip the archive into a clean folder and confirm these files are present:

- `index.html`
- `app.html`
- `README.md`
- `RELEASE_AUDIT.md`
- `RELEASE_MANIFEST.md`
- `RELEASE_SHA256SUMS.txt`
- `docs/BUYER_QUICKSTART.md`
- `docs/FINAL_RELEASE_CHECKLIST.md`
- `docs/GUMROAD_SALES_PAGE.md`
- `docs/SCREENSHOT_INDEX.md`
- `backend/openapi.yaml`
- `backend/migrations/`
- `backend-service/package.json`
- `backend-service/test/`
- `releases/agentpay-api-server-bundle.tar.gz`

## 3. Preview the Website and Console

Open these files in a browser:

- `index.html` for the public corporate website.
- `app.html` for the MVP console.
- `app.html?view=marketplace` for the marketplace console view.
- `app.html?view=escrow` for the escrow console view.

No build step is required for the frontend preview.

## 4. Run Backend Starter Tests

The backend starter is dependency-free and uses the Node.js built-in test runner. From the unzipped package:

```bash
cd backend-service
npm test
```

Expected result:

```text
# tests 13
# pass 13
# fail 0
```

## 5. Check Key Release Files

Review these documents before resale, deployment, or client handoff:

- `docs/LICENSE_AND_USAGE.md`
- `docs/CHANGELOG.md`
- `docs/EXAMPLES_AND_TROUBLESHOOTING.md`
- `backend/DEPLOYMENT_CHECKLIST.md`
- `backend-service/docs/API_SERVER_DEPLOYMENT_RUNBOOK.md`
- `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`

## 6. Confirm Production Boundary

This package is a commercial website, MVP console, backend starter, and launch-control kit. It is not a live payment processor until production infrastructure, legal review, compliance review, real payment credentials, durable databases, and launch gates are completed.
