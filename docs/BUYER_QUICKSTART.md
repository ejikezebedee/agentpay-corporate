# AgentPay User Quickstart

## What This Project Is

AgentPay is an open-source starter project for an agentic commerce platform: a polished corporate website, clickable MVP console, backend API starter, database blueprints, launch-control documents, and deployment scripts.

It is built for founders, agencies, and technical buyers who want to present or extend a wallet, escrow, agent marketplace, and seller-services platform without starting from a blank page.

## Best First Use

Use the package in this order:

1. Review `index.html` and `app.html` in a browser.
2. Read `README.md` for the package overview.
3. Use `docs/BUYER_VERIFICATION_GUIDE.md` to verify the archive and backend starter tests.
4. Upload the static website to your hosting account.
5. Review `backend/` to understand the database and API contract.
6. Run `backend-service/` locally before planning production deployment.
7. Review the flagship `agentpay-corporate` marketplace listing, schema route, and sandbox client environment before sales execution.
8. Use `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md` before any real payment launch.
9. Review `docs/SUPPORT_AND_REFUND_POLICY.md` before offering paid support, setup, hosting, or customization services.
10. Use `docs/CUSTOMIZATION_WORKBOOK.md` for brand edits, client delivery, or paid implementation planning.
11. Use `docs/MARKETPLACE_UPLOAD_PACK.md` before publishing the product on a marketplace.
12. Use `docs/SELLER_PUBLISHING_PACKET.md` when publishing the 5,000 USDT AgentPay Enterprise Node Deployment Package.
13. Use `docs/LAUNCH_EXECUTION_RUNSHEET.md` to track publish gate, listing URL, buyer-agent smoke test, inquiries, and daily launch review.
14. Run `docs/BUYER_ACCEPTANCE_TEST.md` before final handoff.
15. Use `docs/IMPLEMENTATION_SCOPE_PACK.md` when quoting paid setup, customization, or production-planning services.
16. Use `docs/POST_PURCHASE_ONBOARDING_PACK.md` for delivery messages, follow-ups, support intake, and review requests.
17. Use `docs/DEMO_AND_SALES_CALL_PACK.md` for demo calls, objection handling, close options, follow-up email, and call notes.
18. Use `docs/PRICING_AND_ROI_PACK.md` when setting price, defending value, planning discounts, or packaging paid upsells.
19. Use `docs/LICENSE_TIERS_AND_RESELLER_PACK.md` before pricing paid setup, customization, hosting, or implementation-planning services.
20. Use `docs/UPDATE_AND_MAINTENANCE_PACK.md` when publishing updates, patch releases, buyer update notes, compatibility notes, or refreshed archives.
21. Use `docs/COMPLIANCE_AND_RISK_DISCLOSURE_PACK.md` before any real payment, escrow, wallet, personal-data, marketplace settlement, or regulated-activity planning.
22. Use `docs/ENTERPRISE_DUE_DILIGENCE_PACK.md` for procurement review, security review, privacy review, compliance review, investor review, or vendor approval planning.
23. Use `docs/POCKETBASE_RAPID_BACKEND_PACK.md` if you want a fast optional PocketBase backend for demos, admin workflows, onboarding, support, marketplace content, or evidence review.
24. Use `docs/SECURITY_REMEDIATION_PACK.md` to review the latest admin endpoint, rollback script, and frontend rendering hardening notes.
25. Use `docs/SECURITY_OPERATIONS_AND_INCIDENT_RESPONSE_PACK.md` before production planning, buyer handoff, support operation, or incident-response preparation.
26. Use `docs/COMMERCIAL_LAUNCH_AND_DISTRIBUTION_PACK.md` before publishing, promoting, tracking, or following up on the product launch.
27. Use `docs/CUSTOMER_SUCCESS_AND_RETENTION_PACK.md` after launch or buyer delivery to reduce setup friction, triage support, request testimonials, offer maintenance, and track retention signals.
28. Use `docs/PRODUCT_ROADMAP_AND_BACKLOG_PACK.md` before planning MVP extension, production backlog, feature priorities, or acceptance criteria.
29. Use `docs/REVENUE_OPERATIONS_TRACKER_PACK.md` to track inquiries, buyer activation, upsells, support risks, KPIs, maintenance, and follow-up actions.
30. Use `docs/PRIVACY_AND_DATA_GOVERNANCE_PACK.md` before collecting personal data, support records, order records, payment metadata, or admin audit events.
31. Use `docs/INVESTOR_AND_PARTNER_BRIEFING_PACK.md` before investor demos, partner conversations, enterprise briefings, strategic reviews, or founder fundraising follow-up.
32. Use `docs/MARKET_VALIDATION_AND_PILOT_PACK.md` before customer discovery, paid pilot quoting, agency validation calls, or partner proof-of-concept planning.
33. Use `docs/PROCUREMENT_AND_RFP_RESPONSE_PACK.md` when a buyer, agency client, procurement reviewer, partner, or internal stakeholder asks for vendor-review answers before approval.
34. Use `docs/CLIENT_IMPLEMENTATION_HANDOFF_PACK.md` when handing AgentPay to a client, internal team, pilot sponsor, agency stakeholder, or implementation partner.
35. Use `docs/PARTNER_CHANNEL_ENABLEMENT_PACK.md` before recruiting agencies, affiliates, referral partners, implementation partners, training partners, or strategic channel partners.
36. Use `docs/ENTERPRISE_ACCOUNT_EXPANSION_PACK.md` after a demo, pilot, partner introduction, or enterprise review creates an upsell, renewal, rollout, or implementation-planning opportunity.
37. Use `docs/EXECUTIVE_STEERING_AND_REPORTING_PACK.md` when reporting AgentPay status, risks, KPIs, next decisions, pilot signals, partner activity, or expansion opportunities to founders, executives, board observers, sponsors, or steering groups.
38. Use `docs/TEAM_TRAINING_AND_ADOPTION_PACK.md` when onboarding sales, product, engineering, support, procurement, partner, agency, or sponsor teams around AgentPay workflows, roles, adoption signals, and production boundaries.

## Open Locally

No build step is required for the public website or console preview.

```bash
cd agentpay-corporate
open index.html
open app.html
```

On Linux, use your file manager or browser open dialog if `open` is unavailable.

## Run Backend Starter Locally

```bash
cd agentpay-corporate/backend-service
npm test
npm start
```

The starter API listens on port `3000` unless `PORT` is set.

To inspect the flagship listing schema locally after starting the backend starter:

```bash
curl http://localhost:3000/api/v1/listings/agentpay-corporate/schema
```

To inspect the buyer-agent sandbox state:

```bash
curl http://localhost:3000/api/v1/sandbox/client-environment
```

## Deploy Static Website

Upload the contents of `agentpay-corporate/` to your hosting document root. For Hostinger, follow `HOSTINGER_DEPLOYMENT.md`.

The static website is safe to publish as a product preview. It does not move money or store real user data.

## Production API Path

For a live backend, use the API deployment bundle:

- `backend-service/.env.production.example`
- `backend-service/infra/deploy/`
- `backend-service/docs/API_SERVER_DEPLOYMENT_BUNDLE.md`
- `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`
- `backend-service/docs/DNS_CUTOVER_RUNBOOK.md`

Do not activate real payments until the launch-control gates are complete.

## What To Customize First

- Brand name, logo, and contact links.
- Pricing page tiers.
- Marketplace listing examples in `backend/listing-catalog.json`.
- Flagship listing schema route: `/api/v1/listings/agentpay-corporate/schema`.
- API domain in deployment docs.
- Legal pages: terms, privacy, refund policy, and compliance notices.

## User Success Checklist

- Website opens locally.
- Console preview opens locally.
- Backend tests pass.
- Flagship listing appears in the marketplace and console listing views.
- Sandbox console view opens and shows test wallet state, schema discovery, escrow trigger, and launch gate.
- Hosting upload completed.
- Product copy customized.
- Customization workbook completed.
- Marketplace upload pack reviewed.
- Seller publishing packet reviewed for the 5,000 USDT AgentPay Enterprise Node Deployment Package.
- Launch execution run sheet prepared before publishing or test purchase.
- Buyer acceptance test completed.
- Implementation scope reviewed before quoting paid services.
- Post-purchase onboarding templates prepared before marketplace launch.
- Demo and sales call pack prepared before client, buyer, investor, or partner calls.
- Pricing and ROI pack reviewed before setting launch price, discounts, or service bundles.
- Open-source commercial services pack reviewed before quoting paid setup, customization, hosting, or implementation-planning offers.
- Update and maintenance pack reviewed before publishing a refreshed buyer archive or update note.
- Compliance and risk disclosure pack reviewed before any real payment, personal-data, escrow, or marketplace settlement planning.
- Enterprise due diligence pack reviewed before procurement, investor, partner, or internal approval conversations.
- PocketBase rapid backend pack reviewed before using PocketBase for prototype/admin workflows.
- Security remediation pack reviewed before production planning or buyer handoff.
- Security operations and incident response pack reviewed before launch planning or operational handoff.
- Commercial launch and distribution pack reviewed before marketplace publication or outreach.
- Customer success and retention pack reviewed before post-sale support, training, testimonial requests, maintenance offers, or retention tracking.
- Product roadmap and backlog pack reviewed before MVP extension, production planning, paid implementation, or staged feature work.
- Revenue operations tracker pack reviewed before tracking inquiries, activation, upsells, support risk, maintenance, or weekly sales follow-up.
- Privacy and data governance pack reviewed before collecting personal data, support details, order records, payment metadata, or audit events.
- Investor and partner briefing pack reviewed before strategic demos, partner follow-ups, procurement briefings, or investor conversations.
- Market validation and pilot pack reviewed before customer discovery, paid pilot quoting, agency validation calls, or partner proof-of-concept planning.
- Procurement and RFP response pack reviewed before sending vendor-review, RFP, procurement, agency-client, or internal approval answers.
- Client implementation handoff pack reviewed before closing a client, agency, pilot, internal-team, or implementation-partner delivery.
- Partner/channel enablement pack reviewed before recruiting, onboarding, registering, compensating, or handing off partner-led opportunities.
- Enterprise account expansion pack reviewed before proposing upsells, renewals, rollouts, implementation planning, review support, support retainers, or production advisory.
- Executive steering and reporting pack reviewed before leadership updates, board notes, sponsor reviews, KPI reporting, risk escalation, or decision meetings.
- Team training and adoption pack reviewed before internal walkthroughs, agency-client training, partner onboarding, support readiness, technical orientation, or pilot-team enablement.
- Legal pages added.
- Support and refund policy reviewed.
- Production secrets kept outside the package.
- API launch gates reviewed before real transactions.
