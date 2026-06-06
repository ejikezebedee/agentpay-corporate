# Compliance And Risk Disclosure Pack

Use this pack to explain AgentPay's compliance and risk boundaries before any buyer, agency, or developer treats the package as a live payment product.

This document is not legal, tax, financial, compliance, or regulatory advice. It is a buyer-facing readiness and disclosure aid. A qualified professional must review any production use involving real payments, user funds, regulated financial activity, personal data, sanctions exposure, or consumer transactions.

## Core Disclosure

AgentPay is a website, MVP console, backend starter, schema pack, API contract, and launch-planning product.

AgentPay is not:

- A licensed financial institution.
- A regulated payment processor.
- A custody provider.
- A money-transmission service.
- A compliance-approved product.
- A legal, tax, financial, or regulatory advisory product.

## Regulated Activity Warning

Get qualified legal and compliance review before using AgentPay for:

- Holding customer funds.
- Moving customer funds.
- Escrow involving real money.
- Crypto payments or withdrawals.
- Marketplace settlement.
- KYC or identity verification.
- Sanctions screening.
- Cross-border payments.
- Consumer lending or credit.
- Investment, yield, or trading products.
- Stored-value wallets.

## Production Readiness Boundary

The included backend starter demonstrates patterns only:

- Decimal-string money validation.
- Starter webhook signature verification.
- Starter signed agent request verification.
- Escrow state-machine shape.
- Audit-event shape.
- Repository boundary examples.

Before production:

- Replace in-memory storage with durable databases.
- Implement production authentication and authorization.
- Use a secure secret manager or server-only secret storage.
- Verify payment provider credentials.
- Complete webhook reconciliation.
- Add privacy policy and terms of service.
- Complete legal and compliance review.
- Complete security review.
- Complete `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`.

## Privacy And Data Checklist

Before collecting personal data:

- Identify what personal data is collected.
- Define the purpose for each data field.
- Add a privacy policy.
- Add user consent where required.
- Define data retention periods.
- Define deletion/export process.
- Restrict admin access.
- Encrypt sensitive data where appropriate.
- Keep secrets outside frontend files.
- Avoid storing unnecessary personal data.

## KYC/AML Readiness Checklist

Before enabling real payments or marketplace settlement:

- Determine whether KYC is required.
- Determine whether AML monitoring is required.
- Determine sanctions screening requirements.
- Determine transaction monitoring requirements.
- Determine suspicious-activity reporting duties.
- Determine refund, dispute, and chargeback obligations.
- Determine record-retention requirements.
- Confirm whether payment-provider terms allow the use case.
- Confirm whether licenses or registrations are required.

## Security Risk Register

Use this table during production planning.

| Risk | Why It Matters | Required Control |
| --- | --- | --- |
| Exposed secrets | Credentials could be abused | Store secrets server-side only |
| Weak auth | User accounts or admin actions could be compromised | Production auth, roles, sessions, MFA where needed |
| Bad webhook validation | Fake payment events could be accepted | Verify signatures and reconcile with provider API |
| Money precision errors | Balances can become incorrect | Use decimal strings and database numeric types |
| Missing audit logs | Disputes cannot be investigated | Durable audit logging |
| Missing KYC/AML review | Regulated activity can create legal exposure | Qualified compliance review |
| Unsafe admin access | Internal misuse or mistakes can affect users | Least privilege and audit trails |
| No rollback plan | Bad launch can remain live too long | Launch-control and rollback runbooks |

## Buyer Disclosure Block

Use this in listings, handoffs, or invoices:

AgentPay is a commercial starter package for a fintech-style website, MVP console, backend starter, and launch-planning workflow. It is not a live payment processor and does not include legal, financial, tax, compliance, licensing, or regulatory approval. Real payments, escrow, customer funds, user data, and production marketplace settlement require separate production implementation, legal review, compliance review, security review, payment-provider approval, durable infrastructure, and launch-control completion.

## Pre-Launch Compliance Review Questions

Ask before real payment activation:

- What jurisdictions will the product serve?
- Will the product hold or move customer funds?
- Will crypto payments or withdrawals be enabled?
- Will sellers or buyers need identity verification?
- Will the platform process personal data?
- Who is responsible for disputes and refunds?
- Who is responsible for sanctions screening?
- What payment provider terms apply?
- What licenses, registrations, or professional reviews are required?
- What records must be retained?

## Agency Delivery Notes

If delivering AgentPay to a client:

- Do not promise compliance approval.
- Do not promise live payment readiness.
- Do not remove production warnings.
- Document what is demo-ready versus production-ready.
- Put legal, compliance, security, and payment-provider review outside the standard customization scope.
- Use `docs/IMPLEMENTATION_SCOPE_PACK.md` for written scope and acceptance criteria.

## Production Stop Conditions

Do not launch real payments if:

- Payment credentials are unverified.
- Webhook reconciliation is incomplete.
- Production database is not durable.
- Admin access is not controlled.
- Privacy policy and terms are missing.
- Legal or compliance review is unresolved.
- Security review is incomplete.
- Rollback plan is missing.
- Launch-control gates are incomplete.

## Final Risk Checklist

- Buyer understands AgentPay is not a licensed payment processor.
- Buyer understands real payments require separate approval and implementation.
- Privacy and personal-data requirements are identified.
- KYC/AML and sanctions requirements are reviewed where relevant.
- Payment-provider terms are checked.
- Security controls are planned.
- Launch-control gates remain mandatory.
- Scope and disclaimers match `docs/IMPLEMENTATION_SCOPE_PACK.md`.
- Support promises match `docs/SUPPORT_AND_REFUND_POLICY.md`.
