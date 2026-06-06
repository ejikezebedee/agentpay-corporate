# Support And Refund Policy

Use this document as the support baseline for AgentPay open-source users and paid-service customers. Customize the contact channel, support window, and service-specific refund terms before publishing any paid offer.

For ready-to-send delivery, follow-up, support intake, review request, and escalation templates, use `docs/POST_PURCHASE_ONBOARDING_PACK.md`.

## Included Support Scope

Standard community or paid setup support can cover:

- Confirming the repository/archive opens correctly.
- Helping the buyer locate the website, console, backend starter, screenshots, and docs.
- Explaining how to preview `index.html` and `app.html` locally.
- Explaining how to run `npm test` inside `backend-service/`.
- Clarifying the MIT License and production safety boundaries.
- Clarifying that production payments require separate legal, compliance, infrastructure, and security work.

## Not Included By Default

Default support should not include:

- Custom feature development.
- Production deployment on the buyer's server.
- Payment-provider account setup.
- Legal, tax, financial, or compliance advice.
- Debugging buyer-modified code.
- Live transaction activation.
- Ongoing maintenance after handoff.

Offer these items separately as paid implementation, consulting, or extended-support services.

## Suggested Support Window

Recommended standard support window:

- 7 days for download, archive, and setup questions.
- One support thread per purchase.
- Response time target: 1 to 2 business days.

For paid customization, setup, hosting, or implementation-planning services, use a separate service agreement with defined scope, response time, and deliverables.

## Suggested Refund Policy

For the open-source project, code access is free. For paid services, refund terms should match the service agreement, platform policy, and local law.

Recommended wording:

```text
AgentPay Corporate is open source under the MIT License. Paid service fees cover defined support, setup, customization, hosting, or implementation-planning deliverables. Refund terms follow the written service scope, platform policy, and applicable law.
```

## Pre-Purchase Disclosure Checklist

Publish these points clearly on the sales page:

- The project is open source, not a licensed payment processor.
- The frontend can be previewed immediately without a build step.
- The backend starter is included for development and planning.
- Production payment processing requires real infrastructure, credentials, compliance review, and launch gates.
- The MIT License allows broad use and redistribution.
- Paid service scope, response time, and deliverables should be agreed separately.

## Handoff Reply Template

```text
Thank you for using AgentPay Corporate. Start with README.md, then open index.html and app.html locally. Use docs/BUYER_QUICKSTART.md for setup and docs/BUYER_VERIFICATION_GUIDE.md to verify the archive and backend starter tests. Before any live payment launch, review backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md.
```
