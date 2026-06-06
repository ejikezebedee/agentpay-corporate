# Customer Success And Retention Pack

## Purpose

Use this pack after the first sale, client handoff, or agency delivery. It helps the seller or agency keep buyers moving from download to preview, customization, implementation planning, testimonial capture, and optional paid support without promising live payment readiness.

## Success Outcome

A successful buyer should be able to:

- Open the website and console locally.
- Understand that the package is a starter, demo, and planning system.
- Verify checksums and backend starter tests.
- Identify what needs customization.
- Decide whether they need paid implementation, production planning, or maintenance support.
- Avoid using the static preview as a live payment processor.

## First 7 Days Customer Success Cadence

| Timing | Seller action | Buyer goal |
| --- | --- | --- |
| Day 0 | Send delivery note, quickstart link, verification guide, and support scope. | Confirm access and open the package. |
| Day 1 | Ask whether the website, console, and backend tests opened correctly. | Remove setup friction early. |
| Day 3 | Send customization workbook reminder and acceptance test link. | Move buyer from browsing to practical use. |
| Day 5 | Offer implementation-scope review or demo walkthrough. | Convert serious buyers into paid support if needed. |
| Day 7 | Request review, testimonial, or support ticket if unresolved. | Capture feedback and prevent refund surprises. |

## Buyer Health Signals

### Healthy

- Buyer confirms local preview works.
- Buyer asks customization or deployment questions.
- Buyer references specific documents.
- Buyer asks about implementation scope, licensing, or maintenance.
- Buyer requests a walkthrough, quote, or agency handoff support.

### At Risk

- Buyer says the package is "not working" without details.
- Buyer expects live payments out of the box.
- Buyer has not opened the files after purchase.
- Buyer cannot find setup or verification instructions.
- Buyer asks for legal, compliance, KYC, or payment activation guarantees.
- Buyer wants resale or client reuse without reviewing license tier notes.

### Escalate

- Buyer reports missing archive files.
- Buyer reports checksum mismatch.
- Buyer reports a security issue.
- Buyer requests production payment activation.
- Buyer asks for refund before attempting verification steps.
- Buyer wants unauthorized resale, redistribution, or credential handling.

## Support Triage Template

Use this when a buyer asks for help:

```text
Thanks for the note. Please send:

1. Which file or step you are using.
2. Your operating system.
3. Whether `index.html` and `app.html` open locally.
4. Whether you followed `docs/BUYER_VERIFICATION_GUIDE.md`.
5. Any error message as plain text or screenshot.

Reminder: AgentPay is a starter package and preview system. Live payment processing requires production backend integration, legal review, compliance review, and launch-control approval.
```

## Setup Rescue Flow

1. Ask the buyer to open `docs/BUYER_QUICKSTART.md`.
2. Confirm `index.html` opens locally.
3. Confirm `app.html` opens locally.
4. Ask the buyer to verify archive checksum using `docs/BUYER_VERIFICATION_GUIDE.md`.
5. If backend testing is needed, ask them to run the backend starter test flow in `backend-service/`.
6. If the buyer needs customization, route them to `docs/CUSTOMIZATION_WORKBOOK.md`.
7. If the buyer needs paid build support, route them to `docs/IMPLEMENTATION_SCOPE_PACK.md`.
8. If the buyer wants production payments, route them to launch-control, compliance, and security operations packs before any quote.

## Training Session Agenda

Use this agenda for a 30-minute paid walkthrough or client handoff:

| Minute | Topic |
| --- | --- |
| 0-5 | Confirm buyer goal, license scope, and production boundary. |
| 5-10 | Walk through website, console, and screenshot gallery. |
| 10-15 | Review backend starter, API contract, and database boundary. |
| 15-20 | Review customization workbook and acceptance test. |
| 20-25 | Discuss implementation scope, security operations, compliance, and launch-control needs. |
| 25-30 | Agree next action: self-serve setup, paid customization, production planning, or maintenance package. |

## Testimonial Request Template

```text
Thanks for using AgentPay. If the package helped you save planning time, prepare a demo, or structure a client conversation, please send a short review:

- What you used it for
- What saved you time
- Who you would recommend it to

Please do not describe it as a live payment processor unless your own production backend, legal review, compliance review, and payment activation gates are complete.
```

## Renewal Or Maintenance Offer

Use this wording after a serious buyer or agency completes setup:

```text
We can also support a monthly AgentPay maintenance package covering archive updates, documentation refreshes, minor template adjustments, implementation planning calls, and launch-control review. Production payment processing, legal review, compliance review, and custom backend engineering remain separately scoped.
```

## Refund Prevention Checklist

- [ ] Buyer received quickstart, verification guide, support policy, and acceptance test.
- [ ] Buyer was told the product is not a live payment processor out of the box.
- [ ] Buyer had a path to report setup errors with file names and screenshots.
- [ ] Buyer was offered customization or implementation-scope guidance when needed.
- [ ] Buyer expectations were corrected before production payment or compliance claims.
- [ ] Buyer support notes were logged before refund decision.

## Metrics Tracker

| Metric | Target signal |
| --- | --- |
| Download confirmation | Buyer confirms archive access. |
| First open | Buyer opens website and console. |
| Verification | Buyer validates checksums or backend tests. |
| Customization intent | Buyer starts workbook or asks brand questions. |
| Upsell interest | Buyer asks for implementation, walkthrough, or maintenance. |
| Review capture | Buyer sends review, testimonial, or public rating. |
| Risk flag | Buyer expects live payments, compliance approval, or resale rights without review. |

## Final Customer Success Checklist

- [ ] Buyer received a clear first-week path.
- [ ] Setup questions have a triage template.
- [ ] Live payment boundaries remain visible.
- [ ] Training and walkthrough agenda is ready.
- [ ] Testimonial request is ready.
- [ ] Maintenance offer wording is ready.
- [ ] Refund-prevention checks are documented.
- [ ] Metrics can be tracked without collecting unnecessary personal data.
