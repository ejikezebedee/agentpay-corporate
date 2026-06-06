# Customization Workbook

Use this workbook to turn the AgentPay package into a client-ready product demo, founder MVP, or paid agency implementation.

## Buyer Intake

Collect these answers before customizing the package:

- Business or product name.
- Target customer segment.
- Main use case: wallet, marketplace, escrow, seller services, agent purchasing, or API platform.
- Preferred domain and API subdomain.
- Brand colors, logo, and typography preferences.
- Contact email or demo booking link.
- Pricing model and package names.
- Required marketplace listing categories.
- Required payment provider or wallet provider.
- Target launch country or region.
- Legal reviewer, compliance reviewer, and technical owner.

## First-Hour Customization

Prioritize these edits first:

- Replace AgentPay/Zebepay naming where required.
- Replace logo and favicon in `assets/`.
- Update contact links and demo calls to action.
- Update pricing tiers in `pricing.html`.
- Update homepage positioning in `index.html`.
- Update marketplace examples in `backend/listing-catalog.json`.
- Update API domain references in deployment docs.
- Review `docs/LICENSE_AND_USAGE.md` and add project-specific legal pages.

## Demo-Ready Checklist

Before showing the package to investors, clients, or stakeholders:

- Public website opens locally.
- MVP console opens locally.
- Marketplace view opens with `app.html?view=marketplace`.
- Escrow view opens with `app.html?view=escrow`.
- Screenshot gallery matches the current product positioning.
- Backend tests pass inside `backend-service/`.
- Product limitations are disclosed clearly.
- No real payment credentials are included in the demo package.

## Paid Implementation Packages

Use these as service upsells after the digital product sale.

### Setup Review

Scope:

- Verify package integrity.
- Walk through website and console.
- Confirm backend tests run.
- Review buyer customization plan.

Suggested price: USD 99 to USD 199.

### Brand Customization

Scope:

- Replace brand name, colors, logo, and contact links.
- Customize homepage, pricing, marketplace examples, and screenshot captions.
- Prepare a customized ZIP for the buyer.

Suggested price: USD 299 to USD 799.

### MVP Implementation Planning

Scope:

- Review backend schema, OpenAPI contract, and launch-control docs.
- Produce a production implementation plan.
- Identify infrastructure, legal, compliance, payment, and security owners.

Suggested price: USD 500 to USD 1,500.

### Production Build Advisory

Scope:

- Assist with production backend planning.
- Review API deployment bundle.
- Define launch gates, rollback plan, and security checklist.
- Coordinate with the buyer's developer, legal, and compliance teams.

Suggested price: custom quote.

## Client Handoff Checklist

Before handing off a customized version:

- Remove unused placeholder copy.
- Replace all demo contact links.
- Confirm support and refund policy is updated.
- Confirm license terms match the sale.
- Confirm production limitations remain visible.
- Refresh screenshots if the visible UI changed.
- Rebuild the ZIP and checksum file.
- Run `docs/BUYER_VERIFICATION_GUIDE.md` verification steps.

## Implementation Boundary

Do not activate real payments, store user data, or process live transactions as part of a simple template customization. Treat production payment launch as a separate regulated, security-sensitive implementation with legal, compliance, infrastructure, and payment-provider review.
