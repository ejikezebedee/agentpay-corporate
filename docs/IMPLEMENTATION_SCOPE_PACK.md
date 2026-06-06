# Implementation Scope Pack

Use this pack to turn AgentPay from a digital product sale into a scoped setup, customization, or implementation offer.

## Purpose

Buyers often need help deciding what is included in a quick customization versus a real production build. This pack gives sellers and agencies a clear structure for quotes, scope boundaries, delivery milestones, acceptance criteria, and change control.

## Offer Ladder

### Package A: Setup Review

Best for buyers who want confidence before editing or deploying.

Deliverables:

- Archive integrity review.
- Local website and console preview check.
- Backend starter test run.
- Review of buyer goals and customization priorities.
- One written setup summary.

Suggested range: USD 99 to USD 199.

Timeline: 1 to 2 business days.

Out of scope:

- Brand redesign.
- Production API deployment.
- Payment activation.
- Legal, tax, or compliance advice.

### Package B: Brand Customization

Best for founders or agencies who need a client-ready demo.

Deliverables:

- Brand name, logo, color, and contact-link updates.
- Homepage and pricing copy adjustment.
- Marketplace sample listing adjustment.
- Updated screenshot captions if visible copy changes.
- Rebuilt ZIP and checksum file.
- Handoff note with changed files and next steps.

Suggested range: USD 299 to USD 799.

Timeline: 2 to 5 business days.

Out of scope:

- Custom backend features.
- Live payment processing.
- User authentication.
- Production database deployment.

### Package C: MVP Implementation Plan

Best for teams preparing a real build after validating the concept.

Deliverables:

- Review of `backend/`, `backend-service/`, and launch-control docs.
- Production architecture notes for API, database, Redis, logging, and hosting.
- Payment-provider activation checklist.
- Compliance, legal, and security owner matrix.
- Milestone plan for build, test, staging, and launch.

Suggested range: USD 500 to USD 1,500.

Timeline: 3 to 7 business days.

Out of scope:

- Direct production deployment.
- Payment credential handling.
- Regulated financial compliance sign-off.

### Package D: Production Build Advisory

Best for funded teams with developers, legal review, and infrastructure owners.

Deliverables:

- Production API launch review.
- Infrastructure and DNS cutover review.
- Escrow state-machine and ledger boundary review.
- Security and audit-log review.
- Go/no-go launch checklist facilitation.

Suggested range: custom quote.

Timeline: depends on buyer readiness.

Out of scope:

- Acting as licensed compliance counsel.
- Holding buyer credentials.
- Launching live transactions without written approval and verified gates.

## Discovery Questions

Ask these before quoting:

- What business name and domain should be used?
- Is this for a demo, investor presentation, client handoff, or production build?
- Which sections must be customized first: website, console, marketplace listings, backend docs, or sales copy?
- Does the buyer already have a logo, colors, and contact links?
- Does the buyer need Hostinger-only static deployment or a separate API host?
- Which payment provider, wallet provider, or escrow provider is being considered?
- Who owns legal review, compliance review, infrastructure, and security approval?
- What deadline and launch milestone must the work support?
- Will the buyer need a rebuilt ZIP, updated screenshots, or marketplace listing help?

## Quote Template

Copy and adapt this when sending an implementation quote.

```text
Project: AgentPay customization and implementation support
Package: [Setup Review / Brand Customization / MVP Implementation Plan / Production Build Advisory]
Buyer goal: [demo / client handoff / MVP planning / production readiness]

Included deliverables:
- [deliverable 1]
- [deliverable 2]
- [deliverable 3]

Timeline:
- Start: [date]
- Delivery target: [date]
- Review window: [number] business days

Price:
- Fixed fee: USD [amount]
- Payment terms: [upfront / milestone / platform checkout]

Assumptions:
- Buyer provides brand assets, domain details, and contact links.
- Buyer is responsible for legal, tax, compliance, and regulated payment approvals.
- Live payment processing is not included unless separately scoped.

Out of scope:
- Production payment activation.
- Credential custody.
- Legal or compliance sign-off.
- Features not listed above.

Acceptance criteria:
- Website and console open locally.
- Agreed copy and branding changes are visible.
- Backend tests pass if backend starter was touched.
- Rebuilt archive and checksum are delivered if package files changed.
```

## Statement Of Work Outline

Use this outline for higher-value client work.

1. Objective: define the buyer outcome and commercial purpose.
2. Current package baseline: confirm the package version and checksum.
3. Deliverables: list exact files, pages, docs, or setup outputs.
4. Buyer inputs: list assets, decisions, credentials, legal text, and contacts the buyer must provide.
5. Timeline: define draft, review, revision, and handoff dates.
6. Acceptance criteria: define how the buyer confirms completion.
7. Exclusions: state production, legal, compliance, and payment limitations.
8. Change control: any extra page, feature, integration, or revision is a new quote.
9. Handoff: provide changed-file summary, verification steps, and next-step recommendations.

## Change Control Rules

Treat these as new scope:

- Adding new product pages or console modules.
- Connecting live forms, databases, auth, payments, or webhooks.
- Creating new brand identity assets from scratch.
- Rewriting the backend starter into a production service.
- Handling buyer credentials or payment-provider accounts.
- Providing legal, tax, compliance, or licensing advice.

## Delivery Checklist

Before marking a service package complete:

- Confirm buyer-provided assets were used as supplied.
- Confirm no private keys, credentials, or internal paths were added.
- Open `index.html` and `app.html`.
- Run backend starter tests if backend files changed.
- Update screenshots if visible UI changed.
- Update `RELEASE_MANIFEST.md`, `docs/CHANGELOG.md`, and checksums if package files changed.
- Rebuild the ZIP if delivering a customized archive.
- Provide a concise handoff note with changes, verification steps, and remaining production boundaries.

## Production Boundary

Template customization and implementation planning do not authorize live financial activity. Any production launch must pass legal review, compliance review, infrastructure security review, payment-provider approval, durable database setup, audit logging, webhook reconciliation, rollback planning, and written launch approval from the buyer.
