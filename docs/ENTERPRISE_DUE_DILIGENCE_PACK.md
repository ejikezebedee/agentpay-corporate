# Enterprise Due Diligence Pack

Use this pack when a buyer, agency client, procurement team, investor, or technical reviewer asks whether AgentPay is ready for internal vendor review.

This document is a review aid only. It does not replace legal, compliance, security, privacy, finance, or procurement approval.

## Buyer Review Summary

AgentPay is a commercial starter package for a fintech-style website, MVP console, backend starter, database blueprint, API contract, deployment bundle, and launch-control workflow.

The package is suitable for:

- Product demos.
- MVP planning.
- Internal stakeholder review.
- Agency proof-of-concept delivery.
- Founder, investor, and partner walkthroughs.
- Developer handoff before production implementation.

The package is not suitable for:

- Live payment processing without additional implementation.
- Holding or moving customer funds without legal and compliance review.
- Production personal-data collection without privacy review.
- Enterprise production launch without security review.
- Regulated financial activity without professional review.

## Procurement Questionnaire

Use these answers as a starting point for buyer review.

| Question | Suggested Answer |
| --- | --- |
| Is this a finished production payment product? | No. It is a starter package and launch-planning kit. |
| Does it include production payment credentials? | No. Credentials must be supplied and secured by the buyer. |
| Does it store real user data by default? | No. The frontend is static and the backend starter uses local starter storage. |
| Does it include backend source code? | Yes. A Node.js backend starter is included in `backend-service/`. |
| Are database schemas included? | Yes. PostgreSQL and MongoDB schema materials are included. |
| Are tests included? | Yes. Backend starter tests are included. |
| Is legal or compliance approval included? | No. Professional review is required before production use. |
| Is support included? | Only as described in `docs/SUPPORT_AND_REFUND_POLICY.md`. |
| Can agencies customize it for clients? | Yes, within the license and scope boundaries. |
| Can it be redistributed as-is? | The MIT License permits redistribution, but safety disclaimers, copyright notices, and truthful production-readiness claims must remain clear. |

## Security Review Notes

Review these files before any security approval:

- `backend-service/src/auth.js`
- `backend-service/src/binancePay.js`
- `backend-service/src/audit.js`
- `backend-service/src/escrow.js`
- `backend-service/test/`
- `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md`
- `docs/COMPLIANCE_AND_RISK_DISCLOSURE_PACK.md`

Production security work still required:

- Replace starter storage with durable databases.
- Add production identity, roles, sessions, and admin access controls.
- Store secrets only in server-side secret storage.
- Add durable audit logs.
- Add rate limits and abuse controls.
- Complete webhook reconciliation against the payment provider.
- Add monitoring, alerting, backup, and incident response.
- Complete independent security review before real transactions.

## Privacy Review Notes

The static website and console preview should not collect real personal data unless the buyer adds secure backend handling.

Before collecting personal data:

- Add privacy policy and terms of service.
- Identify each personal-data field.
- Define purpose, retention, export, and deletion rules.
- Confirm cookie, tracking, and analytics requirements.
- Restrict admin access to personal data.
- Encrypt sensitive fields where appropriate.
- Keep personal data out of logs unless legally required and protected.

## Compliance Review Notes

Review `docs/COMPLIANCE_AND_RISK_DISCLOSURE_PACK.md` before any real payment, wallet, escrow, marketplace settlement, KYC, AML, sanctions, crypto, or consumer transaction workflow.

Compliance review should confirm:

- Jurisdictions served.
- Whether the product holds or moves funds.
- Whether identity verification is required.
- Whether sanctions screening is required.
- Payment-provider terms.
- Refund, dispute, and chargeback responsibilities.
- Record-retention duties.
- Licensing or registration requirements.

## Evidence Map

Use this map during buyer review.

| Evidence Need | File |
| --- | --- |
| Product overview | `README.md` |
| Buyer setup | `docs/BUYER_QUICKSTART.md` |
| Archive verification | `docs/BUYER_VERIFICATION_GUIDE.md` |
| Acceptance testing | `docs/BUYER_ACCEPTANCE_TEST.md` |
| API contract | `backend/openapi.yaml` |
| Database schema | `backend/schema.sql` |
| Backend starter | `backend-service/` |
| Backend tests | `backend-service/test/` |
| Launch controls | `backend-service/docs/PRODUCTION_LAUNCH_CONTROL.md` |
| Compliance boundaries | `docs/COMPLIANCE_AND_RISK_DISCLOSURE_PACK.md` |
| License boundaries | `docs/LICENSE_TIERS_AND_RESELLER_PACK.md` |
| Support scope | `docs/SUPPORT_AND_REFUND_POLICY.md` |
| Release audit | `RELEASE_AUDIT.md` |
| Checksums | `RELEASE_SHA256SUMS.txt` |

## Vendor Review Handoff Note

Use this note when sending the package for internal review:

AgentPay is being reviewed as a commercial MVP starter and launch-planning package, not as a production payment processor. The review should cover product fit, implementation scope, security requirements, privacy requirements, compliance requirements, license rights, and support boundaries before any production use. Real payment activation requires separate production infrastructure, provider credentials, legal review, compliance review, security review, and launch-control completion.

## Approval Gate Checklist

- Product owner confirms intended use.
- Technical reviewer confirms implementation gaps.
- Security reviewer confirms required production controls.
- Privacy reviewer confirms data collection boundaries.
- Compliance reviewer confirms regulated-activity requirements.
- Legal reviewer confirms terms, privacy, licensing, and buyer obligations.
- Procurement reviewer confirms license tier and support scope.
- Launch owner confirms real payments remain disabled until launch-control gates pass.

## Red Flags

Pause procurement or production planning if:

- The buyer expects a live payment processor out of the box.
- The buyer wants to hold or move customer funds without legal review.
- The buyer wants to remove compliance or security warnings.
- The buyer wants to collect personal data without privacy review.
- The user wants exclusivity, regulatory claims, or production payment claims beyond the MIT License and documented launch gates.
- The buyer wants production launch without backend, audit, and payment-provider reconciliation work.

## Final Due-Diligence Checklist

- Intended use is documented.
- Production limitations are understood.
- Security review notes are captured.
- Privacy review notes are captured.
- Compliance review notes are captured.
- License tier is confirmed.
- Support scope is confirmed.
- Evidence map files are available.
- Real payment activation remains gated.
