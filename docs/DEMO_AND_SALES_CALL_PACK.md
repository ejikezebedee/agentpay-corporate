# Demo And Sales Call Pack

Use this pack to present AgentPay to a buyer, client, investor, or internal sponsor without improvising the product story. It is written for a 15 to 30 minute call and keeps the boundary clear: AgentPay is a commercial starter and MVP foundation, not a licensed live payment processor.

## Best Use Cases

- Marketplace product listing demo.
- Client discovery call for a paid customization project.
- Founder pitch rehearsal before investor or partner conversations.
- Agency handoff call after brand customization.
- Internal go/no-go review before a production backend build.

## Pre-Call Checklist

- Open `index.html` in one browser tab.
- Open `app.html` in a second browser tab.
- Keep `docs/IMPLEMENTATION_SCOPE_PACK.md` ready for quote discussion.
- Keep `docs/BUYER_ACCEPTANCE_TEST.md` ready for handoff verification.
- Keep `docs/POST_PURCHASE_ONBOARDING_PACK.md` ready if the buyer asks what happens after purchase.
- Confirm that no live payment credentials, customer data, or production secrets are being shown.

## 15-Minute Demo Flow

### Minute 0-2: Positioning

Suggested script:

AgentPay is a ready-to-customize starter for an agentic commerce platform. It gives you the website, clickable console, backend starter, API contract, database boundaries, escrow logic, and launch-control documents needed to present or plan a serious MVP.

Key point to make:

- The package saves product framing and implementation-planning time.
- It is strongest as a demo foundation, client prototype, or technical planning pack.
- Real money movement still requires production backend work, legal review, compliance review, and verified payment credentials.

### Minute 2-5: Public Website

Show:

- Home page positioning.
- Product sections for wallet, escrow, marketplace, sellers, API, and trust.
- Pricing and contact paths.
- Responsive static deployment readiness.

Talk track:

The website is ready for a buyer to customize, deploy, and use as the public face of a fintech-style MVP or client prototype.

### Minute 5-10: Product Console

Show:

- Dashboard overview.
- Wallet and transaction preview.
- Marketplace listings.
- Seller publishing flow.
- Escrow state preview.
- API-key/admin surfaces.

Talk track:

The console is a clickable product preview that helps stakeholders understand the operating model before funding or building the full backend.

### Minute 10-13: Backend Starter And Launch Controls

Show:

- `backend/openapi.yaml`
- `backend/schema.sql`
- `backend-service/`
- `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`
- `backend-service/docs/DNS_CUTOVER_RUNBOOK.md`

Talk track:

The backend starter is intentionally conservative. It includes tests, money validation, webhook verification shape, signed agent request verification, escrow transitions, and deployment runbooks. It must be connected to durable infrastructure before live transactions.

### Minute 13-15: Commercial Next Step

Suggested close:

If you want the fastest path, start with brand customization and a verified static deployment. After that, scope the production backend separately with clear compliance, payment, and infrastructure gates.

Offer path:

- Starter customization.
- Implementation planning.
- Production backend build planning.
- Compliance and launch-readiness review.

## 30-Minute Demo Flow

Use the 15-minute flow, then add:

- Buyer verification guide walkthrough.
- Acceptance test checklist review.
- Marketplace upload pack review if the buyer plans to resell or list the package.
- Customization workbook review if this is an agency or client engagement.
- Implementation scope discussion for paid services.

## Common Buyer Objections

### Is this a live payment processor?

Answer:

No. It is a commercial starter and MVP planning package. It includes frontend, console, backend starter, schemas, API contract, and launch controls. Live payment processing requires production infrastructure, credentials, legal review, compliance review, durable audit logging, and verified payment reconciliation.

### Can I deploy it today?

Answer:

Yes, the static website and console preview can be deployed today. The backend starter can be run locally for development. Real payment features require a separate production backend deployment and launch-control process.

### Why buy this instead of a normal template?

Answer:

This is not only a landing page. It includes product console screens, database boundaries, OpenAPI contract, escrow state machine, backend starter, deployment bundle, verification guide, sales copy, support policy, customization workbook, and launch-control docs.

### Can an agency customize this for a client?

Answer:

Yes. Use `docs/CUSTOMIZATION_WORKBOOK.md` for intake and `docs/IMPLEMENTATION_SCOPE_PACK.md` for quoting, scope boundaries, acceptance criteria, and change control.

### Does it include legal or compliance approval?

Answer:

No. It includes safety wording and launch gates, but it is not legal, tax, financial, or compliance advice. A qualified professional must review any production use involving regulated activity.

## Demo Close Options

### Digital Product Buyer Close

You can buy the package, verify the archive with the checksum guide, preview it locally, customize the brand, and deploy the static website first. The backend starter and launch docs are there for your developer or implementation partner.

### Agency Service Close

The fastest paid engagement is a fixed-scope customization and deployment review. After that, the backend implementation should be quoted separately because it depends on payment provider approval, compliance requirements, hosting target, and launch gates.

### Investor Or Partner Close

AgentPay demonstrates the product model, user flows, marketplace structure, and backend boundary thinking. It is useful for evaluating the MVP direction before committing to a full production build.

## Follow-Up Email

Subject: AgentPay demo recap and next steps

Hi [Name],

Thanks for reviewing AgentPay today.

Here is the recommended path:

1. Verify the buyer archive using `docs/BUYER_VERIFICATION_GUIDE.md`.
2. Preview `index.html` and `app.html` locally.
3. Review the static deployment instructions.
4. Complete the customization workbook if you want brand or client-specific edits.
5. Use the implementation scope pack before planning any live backend or payment launch.

Important boundary: AgentPay is a website, MVP console, backend starter, and launch-planning package. It is not a live payment processor until production infrastructure, legal review, compliance review, credentials, audit logging, and launch-control gates are complete.

Best,
[Seller Name]

## Call Notes Template

Buyer name:

Business type:

Primary use case:

Needs static deployment:

Needs brand customization:

Needs backend implementation:

Payment/compliance requirements:

Decision maker:

Timeline:

Budget range:

Next action:

Follow-up date:

## Demo Quality Checklist

- Website loads without broken navigation.
- Console loads and key views are clickable.
- Demo avoids promises of live payment readiness.
- Backend limitations are explained plainly.
- Buyer knows which docs to read first.
- Buyer receives a clear next step.
- Any paid service discussion is tied to written scope and acceptance criteria.
