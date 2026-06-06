# Update And Maintenance Pack

Use this pack to maintain AgentPay after release, publish clear buyer updates, and separate product updates from paid customization or production implementation.

This pack is for commercial product operations. It does not create a support obligation beyond the written support policy.

## Versioning Model

Use simple phase-based releases for buyer-facing updates.

Recommended format:

- Phase number: internal release milestone.
- Release date: date the buyer archive was refreshed.
- Archive checksum: checksum from `agentpay-corporate.zip.sha256`.
- Update type: docs, frontend, backend starter, deployment, sales pack, license pack, or maintenance pack.

Example:

- Phase 24
- Release date: 2026-06-05
- Update type: maintenance documentation
- Archive checksum: [current checksum]

## Update Types

### Documentation Patch

Use for:

- Buyer quickstart updates.
- Sales copy improvements.
- License wording clarifications.
- Support policy wording.
- Demo, pricing, onboarding, or maintenance docs.

Validation:

- Markdown files reviewed.
- Commercial cleanup scan passed.
- Checksums refreshed.
- ZIP rebuilt and verified.

### Frontend Patch

Use for:

- Copy edits.
- Navigation fixes.
- Responsive layout fixes.
- Static page changes.
- Console preview content updates.

Validation:

- Browser preview check.
- JavaScript syntax check.
- Static archive rebuild.
- Checksums refreshed.

### Backend Starter Patch

Use for:

- Tests.
- Route starter updates.
- Schema updates.
- OpenAPI updates.
- Deployment script improvements.

Validation:

- Backend tests pass.
- JSON files parse cleanly.
- API bundle refreshed if backend-service or deployment files changed.
- Checksums and ZIP refreshed.

### Commercial Pack Patch

Use for:

- Gumroad copy.
- Marketplace upload pack.
- Buyer onboarding.
- Pricing and ROI pack.
- License tiers and reseller pack.
- Demo and sales call pack.

Validation:

- Claims match safety boundaries.
- No live-payment readiness is implied.
- Support and license wording remain consistent.
- Checksums and ZIP refreshed.

## Patch Release Checklist

- Identify changed files.
- Confirm whether API server bundle must be rebuilt.
- Run backend tests if backend or package validation is affected.
- Run JavaScript syntax checks after frontend script changes.
- Parse JSON after schema, catalog, or package metadata changes.
- Run commercial cleanup scan for private paths, internal references, private keys, real emails, and token-like secrets.
- Refresh `RELEASE_SHA256SUMS.txt`.
- Rebuild `agentpay-corporate.zip`.
- Refresh `agentpay-corporate.zip.sha256`.
- Verify release checksums.
- Verify ZIP checksum.
- Run ZIP integrity test.
- Add a changelog entry.

## Buyer Update Note Template

Subject: AgentPay package update - Phase [number]

Hello,

AgentPay has been refreshed to Phase [number].

What changed:

- [Change 1]
- [Change 2]
- [Change 3]

What did not change:

- This remains a website, MVP console, backend starter, and planning package.
- It is not a live payment processor.
- Real payment movement still requires production infrastructure, legal review, compliance review, secure credentials, durable audit logging, and launch-control gates.

Recommended action:

1. Download the latest archive.
2. Verify the checksum using `agentpay-corporate.zip.sha256`.
3. Review `docs/CHANGELOG.md`.
4. Review any new or updated docs related to your use case.

Best,
[Seller Name]

## Buyer Compatibility Note

Use this when buyers already customized an earlier version:

If you already customized a previous AgentPay package, do not overwrite your customized files blindly. Compare the updated docs, scripts, and schemas against your current project. Copy only the sections you need, then re-run your own acceptance checks.

## Maintenance Boundary

Included in product maintenance:

- Clarifying buyer documentation.
- Fixing packaging issues.
- Updating screenshots or sales materials.
- Improving setup instructions.
- Correcting broken links or inconsistent wording.

Not included unless separately purchased:

- Custom branding work.
- Client-specific deployment.
- Production backend build.
- Payment-provider approval.
- Compliance review.
- Legal documentation.
- Live incident response.
- Long-term managed hosting.

## Update Priority Rules

High priority:

- Security boundary clarification.
- Misleading production-readiness wording.
- Broken archive or checksum issue.
- Missing required buyer file.
- Invalid JSON, syntax, or backend test failure.

Medium priority:

- Better sales copy.
- Better onboarding.
- More complete FAQ.
- More examples.
- More implementation notes.

Low priority:

- Cosmetic wording changes.
- Optional marketplace copy variants.
- Nonessential formatting improvements.

## Archive Refresh Notes

When refreshing a buyer archive:

- Keep paths portable.
- Do not include workspace paths.
- Do not include private credentials.
- Do not include real buyer data.
- Do not include internal operational notes.
- Keep `RELEASE_MANIFEST.md` current.
- Keep `docs/CHANGELOG.md` current.
- Keep `RELEASE_SHA256SUMS.txt` current.
- Keep `agentpay-corporate.zip.sha256` current.

## Final Maintenance Checklist

- Phase number updated.
- Changelog updated.
- Manifest updated.
- Release audit updated if readiness changed.
- New docs linked from buyer quickstart where useful.
- Checksums refreshed.
- ZIP rebuilt and verified.
- Cleanup scan passed.
- Buyer update note prepared.
