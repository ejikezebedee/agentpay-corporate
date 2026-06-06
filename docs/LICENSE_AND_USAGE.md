# License And Usage Terms

## Open-Source License

AgentPay Corporate is released under the MIT License. The full license text is available in `LICENSE`.

You may:

- Use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the project.
- Customize the website, console, backend starter, docs, schemas, and deployment scripts.
- Deploy a customized version for a business, startup, client project, internal prototype, or public demo.
- Sell implementation, support, hosting, customization, training, compliance-planning, or managed deployment services around the open-source project.

You must:

- Include the MIT copyright and permission notice in substantial copies of the software.
- Avoid claiming that the project is a licensed payment processor, regulated financial product, or production-ready payment system without completing the required legal, compliance, security, and infrastructure work.
- Keep production safety warnings visible when real payments, user data, escrow, wallet balances, or payment-provider credentials are involved.

## Commercial Services

Commercial packaging should focus on services, support, customization, hosting, private walkthroughs, managed deployment, enterprise hardening, and compliance-readiness planning. Do not present the open-source code itself as proprietary or exclusive.

## Compliance Notice

This package is not legal, tax, financial, or compliance advice. The buyer is responsible for payment licensing, privacy policy, terms of service, sanctions controls, KYC/AML obligations, consumer protection, and other requirements that apply in their jurisdiction.

## Production Payment Notice

The included backend service is a starter. It demonstrates route shape, money validation, webhook verification, audit events, and escrow-state logic. It does not complete a production payment system.

Before real transactions:

- Replace in-memory storage with production repositories.
- Use secure authentication and authorization.
- Store secrets in a secret manager or server-only environment.
- Verify payment-provider credentials and webhooks.
- Complete `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`.
- Complete legal and compliance review.

## Attribution

Users may remove or replace AgentPay/Zebepay branding in customized versions unless a separate trademark, partnership, or service agreement says otherwise. The MIT License covers copyright permission; it does not grant rights to misrepresent ownership, endorsement, regulatory status, or production readiness.
