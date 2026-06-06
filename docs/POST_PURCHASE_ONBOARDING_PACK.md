# Post-Purchase Onboarding Pack

Use this pack after a buyer purchases AgentPay. It reduces confusion, sets support boundaries, and creates a clean path from download to verification, customization, and optional paid implementation.

## Immediate Delivery Message

Send this after purchase or include it in the marketplace delivery note.

```text
Subject: Your AgentPay package is ready

Thanks for purchasing AgentPay Corporate Website + MVP Console + API Launch Pack.

Start here:
1. Download and unzip the package.
2. Open README.md.
3. Open index.html and app.html in your browser.
4. Follow docs/BUYER_VERIFICATION_GUIDE.md to verify the archive and checksums.
5. Use docs/BUYER_ACCEPTANCE_TEST.md before handoff or deployment.

Important boundary:
AgentPay is a website, MVP console, backend starter, and launch-control pack. It is not a live payment processor until production infrastructure, legal review, compliance review, secure secrets, durable databases, and launch gates are completed.

If you want help customizing the package, use docs/CUSTOMIZATION_WORKBOOK.md and docs/IMPLEMENTATION_SCOPE_PACK.md to prepare a clear request.
```

## First-24-Hour Buyer Email

```text
Subject: Recommended first steps for AgentPay

Here is the fastest way to get value from AgentPay in the first 24 hours:

1. Preview the public site with index.html.
2. Preview the console with app.html.
3. Review docs/GUMROAD_SALES_PAGE.md for positioning and copy.
4. Review backend/openapi.yaml and backend-service/README.md if you plan to extend the API.
5. Run npm test inside backend-service if you want to validate the backend starter.

Do not add live payment credentials or real customer data during the preview stage.

If the package is for a client, complete docs/CUSTOMIZATION_WORKBOOK.md first so branding, scope, and handoff expectations are clear.
```

## Day-3 Follow-Up Email

```text
Subject: Have you verified your AgentPay package?

A quick checkpoint:

- Did index.html open correctly?
- Did app.html open correctly?
- Did the checksum verification pass?
- Did backend-service tests pass if you ran them?
- Have you reviewed the production boundary before using real payment or customer data?

For handoff work, run docs/BUYER_ACCEPTANCE_TEST.md.

For paid setup, customization, or implementation planning, use docs/IMPLEMENTATION_SCOPE_PACK.md to define the quote, deliverables, timeline, exclusions, and acceptance criteria.
```

## Day-7 Upsell Follow-Up

```text
Subject: Need help turning AgentPay into your own branded demo?

If you want AgentPay customized for your brand, client, or investor demo, the package includes two planning documents:

- docs/CUSTOMIZATION_WORKBOOK.md
- docs/IMPLEMENTATION_SCOPE_PACK.md

Common paid service options:
- Setup review
- Brand customization
- MVP implementation plan
- Production build advisory

Live payments, user data, payment credentials, and compliance sign-off are separate production workstreams and are not included in a basic template customization.
```

## Support Intake Form

Ask buyers to send this information with any support request:

```text
Purchase platform:
Purchase email:
Package version or phase:
Operating system:
Browser:
Issue summary:
Steps already tried:
Screenshot or screen recording attached:
Did README.md open:
Did index.html open:
Did app.html open:
Did RELEASE_SHA256SUMS.txt verify:
Did backend-service npm test pass:
Files customized so far:
Is this for preview, client handoff, or production planning:
```

## Review Request Message

Send only after the buyer confirms the package opened or the handoff was accepted.

```text
Subject: Quick review request for AgentPay

Thanks for confirming AgentPay opened successfully.

If the package helped you save time on product framing, website setup, MVP console planning, or backend architecture, a short review on the purchase platform would help future buyers understand what they are getting.

Useful points to mention:
- Website and console preview quality
- Documentation clarity
- Backend starter usefulness
- Launch-control and verification guidance
```

## Refund-Prevention Checklist

Before approving or denying a support request, confirm:

- Buyer can locate `README.md`.
- Buyer can open `index.html`.
- Buyer can open `app.html`.
- Buyer understands this is not a live payment processor.
- Buyer has reviewed `docs/BUYER_VERIFICATION_GUIDE.md`.
- Buyer has shared the support intake form details.
- Buyer is not asking for out-of-scope production work as basic support.
- Platform refund rules and local law are respected.

## Internal Seller Notes

Use these rules when replying to buyers:

- Keep replies short, factual, and practical.
- Point to exact files inside the package.
- Do not request or hold private credentials.
- Do not promise legal, tax, compliance, or payment-provider approval.
- Separate template support from production build work.
- Offer paid implementation only after the buyer confirms the package opened or clearly requests customization.

## Escalation Paths

Use this routing:

- File access or unzip problem: send quickstart and verification steps.
- Website preview problem: request browser, OS, and screenshot.
- Backend starter problem: request Node.js version and test output.
- Customization request: send customization workbook.
- Quote request: send implementation scope pack.
- Live payment request: redirect to production launch-control docs and require separate scoped work.
- Refund request: use support and refund policy wording.

## Production Boundary Reminder

No onboarding, support, or upsell message should imply that the package processes live payments out of the box. Any live transaction flow requires verified infrastructure, secrets management, legal review, compliance review, payment-provider approval, durable storage, audit logging, reconciliation, monitoring, rollback planning, and explicit launch approval.
