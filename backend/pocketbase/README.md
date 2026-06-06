# AgentPay PocketBase Prototype Plan

This folder contains optional PocketBase planning material for fast AgentPay demos, admin workflows, support intake, onboarding, marketplace listing management, and evidence review.

PocketBase is not required to use the main AgentPay package.

## Included

- `agentpay-pocketbase-collections.plan.json`: prototype collection plan for buyers, sellers, listings, demo orders, support tickets, onboarding tasks, evidence documents, and review notes.

## Boundary

Use PocketBase for prototype/admin workflows only.

Do not use it as the final store for:

- Wallet ledger records.
- Escrow settlement records.
- Payment-provider reconciliation.
- Regulated financial records.
- Long-term audit logs.

Use `docs/POCKETBASE_RAPID_BACKEND_PACK.md` before introducing PocketBase into any buyer demo, client handoff, or implementation plan.
