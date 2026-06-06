# PocketBase Rapid Backend Pack

Use this pack to add a fast optional backend path for AgentPay demos, admin workflows, onboarding records, marketplace content management, support intake, and evidence review.

PocketBase is useful for speed. It must not replace the final production payment ledger, escrow settlement store, webhook reconciliation store, or regulated financial records.

## What PocketBase Adds

PocketBase can help a buyer or agency create a working internal backend quickly:

- Admin UI for operators.
- Authentication for internal users.
- SQLite-backed records for demo data.
- File uploads for onboarding and evidence documents.
- Realtime updates for support and review workflows.
- REST API for frontend prototype integration.

## Best AgentPay Use Cases

- Marketplace listing CMS.
- Buyer onboarding records.
- Seller intake records.
- Support tickets.
- Implementation requests.
- Procurement/evidence vault records.
- Demo order tracking.
- Internal review notes.
- Admin-only workflow status boards.

## Do Not Use PocketBase For

- Final wallet ledger.
- Final escrow settlement records.
- Payment-provider reconciliation.
- Regulated customer-funds storage.
- High-volume financial transaction history.
- KYC/AML decisioning without professional review.
- Long-term audit records that must meet regulated retention rules.

## Recommended Architecture

Use PocketBase beside the existing AgentPay stack:

| Layer | Recommended Store |
| --- | --- |
| Static website and console | Existing HTML/CSS/JS package |
| Demo CMS and onboarding | PocketBase |
| Support and implementation intake | PocketBase |
| Evidence vault metadata | PocketBase |
| Production orders and escrow | PostgreSQL |
| Payment webhooks and reconciliation | Production API + PostgreSQL |
| Searchable marketplace discovery | MongoDB or PocketBase during prototype |
| Durable audit logs | Production API + append-only audit store |

## PocketBase Collections Plan

Use `backend/pocketbase/agentpay-pocketbase-collections.plan.json` as the prototype data model plan.

Recommended collections:

- `agentpay_buyers`
- `agentpay_sellers`
- `agentpay_listings`
- `agentpay_demo_orders`
- `agentpay_support_tickets`
- `agentpay_onboarding_tasks`
- `agentpay_evidence_documents`
- `agentpay_review_notes`

The included JSON is a planning schema. Before importing into a specific PocketBase release, confirm field syntax against the installed PocketBase version.

## Setup Flow

1. Download PocketBase from the official release page.
2. Start PocketBase locally.
3. Create the first admin user.
4. Create the AgentPay prototype collections from the collection plan.
5. Add sample listings, buyer records, seller records, support tickets, and onboarding tasks.
6. Keep all real payment, escrow, KYC, and regulated records out of PocketBase unless reviewed and approved for that production use.

Example local flow:

```bash
./pocketbase serve
```

Then open the local admin URL shown by PocketBase and configure the prototype collections.

## Frontend Integration Notes

For prototype-only integration:

- Read public marketplace listings from PocketBase.
- Submit buyer onboarding requests to PocketBase.
- Submit support tickets to PocketBase.
- Display demo order status from PocketBase.
- Keep payment buttons in disabled/demo mode unless the production API is connected.

Do not put PocketBase admin credentials, service credentials, or API secrets in frontend files.

## Security Hardening Checklist

Before using PocketBase outside a local demo:

- Use the latest PocketBase release.
- Restrict the admin panel to trusted operators.
- Use strong admin passwords.
- Limit public collection rules.
- Avoid public write access unless required and rate limited.
- Do not install untrusted hooks, plugins, or migrations.
- Do not run untrusted JavaScript hooks.
- Keep `pb_data/` out of public web roots.
- Back up `pb_data/` securely.
- Put PocketBase behind HTTPS.
- Use a reverse proxy with request-size limits.
- Restrict uploads by file type and size.
- Review CORS settings.
- Disable or lock down unnecessary collections.
- Separate demo records from production financial records.

## JS Hook Warning

PocketBase supports powerful server-side JavaScript hooks. That power is useful, but it can also read files, write files, and run server-side operations depending on configuration and exposed bindings.

Only use hooks from trusted developers. Do not paste unknown scripts into a production PocketBase instance.

## Migration Path To Production

Use PocketBase to prove workflow shape. Move production financial records into the AgentPay production backend before real money moves.

Suggested migration:

1. Export PocketBase prototype records.
2. Keep listing and onboarding records as non-financial business data.
3. Move orders, escrow, payment, and audit records to PostgreSQL.
4. Connect payment webhooks only to the production API.
5. Reconcile provider events against PostgreSQL records.
6. Keep PocketBase as an internal CMS/support tool if it still adds value.

## Buyer Disclosure Block

Use this wording when offering the PocketBase option:

AgentPay includes an optional PocketBase rapid backend plan for demos, admin workflows, onboarding, support, and marketplace content management. It is not the final payment ledger, escrow settlement engine, payment-provider reconciliation system, or regulated financial record store. Real payments require the production API, PostgreSQL settlement records, durable audit logs, provider verification, security review, compliance review, and launch-control completion.

## Final PocketBase Checklist

- PocketBase is used only for approved prototype/admin workflows.
- Production payment and escrow records remain outside PocketBase.
- Admin access is restricted.
- Collection rules are reviewed.
- Upload rules are reviewed.
- Backups are configured.
- HTTPS and proxy settings are planned.
- Untrusted hooks are prohibited.
- Migration path to PostgreSQL is documented.
- Buyer understands the prototype boundary.
