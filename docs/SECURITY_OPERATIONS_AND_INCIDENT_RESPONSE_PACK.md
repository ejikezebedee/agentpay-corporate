# Security Operations And Incident Response Pack

Use this pack after the AgentPay demo or starter backend is in use by a buyer, agency, or implementation team.

This is an operational checklist, not a substitute for professional security, legal, compliance, or forensic review.

## Security Operations Scope

This pack covers:

- Secret rotation.
- Admin access review.
- Backup response.
- Vulnerability intake.
- Incident triage.
- Payment launch stop conditions.
- Buyer communication.
- Post-incident cleanup.

It does not make the product production-ready for live payments by itself.

## Operating Cadence

Use this lightweight cadence during implementation:

| Frequency | Action |
| --- | --- |
| Before handoff | Confirm no demo credentials remain |
| Weekly during build | Review admin users and exposed endpoints |
| Before launch | Rotate secrets and verify webhook configuration |
| After every patch | Run buyer acceptance and checksum verification |
| After every incident | Complete post-incident review and remediation notes |

## Secret Rotation Checklist

Rotate secrets when:

- A developer leaves the project.
- A credential may have been pasted into chat, docs, logs, or tickets.
- A buyer moves from demo to production planning.
- A deployment environment changes.
- A payment provider key is regenerated.
- A backup or archive may have been exposed.

Minimum rotation steps:

1. Identify affected environment.
2. Disable old secret where possible.
3. Generate a new secret.
4. Store it only in server-side secret storage.
5. Restart affected services.
6. Run health and smoke checks.
7. Confirm old secret no longer works.
8. Record the rotation date and owner.

Never place production secrets in:

- Frontend files.
- Screenshots.
- Public docs.
- Marketplace uploads.
- Client chat threads.
- Support tickets.
- ZIP archives.

## Admin Access Review

Review admin access before any buyer handoff:

- List all admin users.
- Remove unused accounts.
- Confirm each admin has a named owner.
- Confirm strong passwords are used.
- Enable MFA where available.
- Restrict admin access by IP where feasible.
- Confirm no shared admin accounts are used in production.
- Confirm support operators do not have payment-control access unless required.

## Backup Response Checklist

Before production:

- Define backup location.
- Define backup frequency.
- Define restore owner.
- Test restore process.
- Encrypt backups where appropriate.
- Keep backups outside public web roots.
- Document retention window.
- Confirm backups do not include unnecessary secrets.

If a backup may be exposed:

1. Treat it as a security incident.
2. Identify included data.
3. Rotate included secrets.
4. Check whether personal data is included.
5. Review legal and compliance notification duties.
6. Remove exposed copy where possible.
7. Record remediation actions.

## Vulnerability Intake

Use this intake template when someone reports a security concern:

| Field | Notes |
| --- | --- |
| Reporter | Name or contact |
| Date received | Date and timezone |
| Affected component | Website, console, backend starter, PocketBase, deployment script, docs |
| Severity claimed | Reporter claim |
| Reproduction steps | Keep defensive and authorized only |
| Data exposure | Yes, no, unknown |
| Payment impact | Yes, no, unknown |
| Status | New, triage, confirmed, false positive, fixed, closed |
| Owner | Internal handler |
| Fix notes | Patch, config change, or documentation change |

Do not request or share exploit code beyond what is necessary for defensive validation.

## Incident Severity Guide

| Severity | Examples | Action |
| --- | --- | --- |
| Critical | Production secret exposure, unauthorized payment action, customer data exposure | Stop launch, rotate secrets, escalate immediately |
| High | Admin route exposed, webhook spoofing risk, backup exposure | Disable affected path, patch, verify |
| Medium | Unsafe demo config, excessive public rules, outdated dependency | Patch before launch or buyer handoff |
| Low | Documentation ambiguity, demo-only warning gap | Fix in next patch |

## Payment Stop Conditions

Stop real payment planning if:

- Payment provider credentials are unverified.
- Admin access is not reviewed.
- Webhook signatures are not verified.
- Webhook events are not reconciled with provider API.
- Production database is not durable.
- Audit logs are not durable.
- Rollback path is untested.
- Privacy policy and terms are missing.
- Legal/compliance review is incomplete.
- Incident owner is not assigned.

## Incident Response Flow

1. Contain the issue.
2. Preserve relevant logs.
3. Disable exposed credentials or routes.
4. Rotate secrets.
5. Patch the affected file or configuration.
6. Run tests and smoke checks.
7. Refresh checksums and release archive if buyer-facing files changed.
8. Notify affected buyer or stakeholder if required.
9. Record final remediation notes.
10. Add a prevention item to the next checklist.

## Buyer Communication Template

Subject: AgentPay security update

We identified and resolved a security-relevant issue affecting the AgentPay starter package or implementation plan. The package remains a starter and is not a live payment processor. Before any production payment use, complete the launch-control, legal, compliance, security, and provider verification steps.

What changed:

- Issue:
- Affected files/config:
- Fix applied:
- Buyer action required:
- Verification completed:

## Post-Incident Review

After resolution, record:

- What happened.
- When it was found.
- How it was contained.
- Which files/configs changed.
- Which tests were run.
- Whether secrets were rotated.
- Whether buyer communication was required.
- What prevention item was added.

## Final Security Operations Checklist

- Secret rotation path documented.
- Admin access review documented.
- Backup response path documented.
- Vulnerability intake template ready.
- Incident response flow ready.
- Payment stop conditions visible.
- Buyer communication template ready.
- Post-incident review checklist ready.
- Production launch remains blocked until security and compliance gates pass.
