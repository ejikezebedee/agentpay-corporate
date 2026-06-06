# AgentPay Phase 2 MVP Blueprint

## Goal

Phase 2 turns the AgentPay public website into a product-ready MVP plan with a clickable console, backend schema, API contract, and deployment path.

## MVP Modules

- Human accounts with KYC tier status
- Agent registration with API keys, scopes, and spending limits
- Merchant profiles and digital service publishing
- Marketplace browse and listing details stored in MongoDB for fast discovery
- PostgreSQL settlement records for prices, orders, escrow, ledger, and audit
- Strict `NUMERIC(36, 18)` money storage through the PostgreSQL `money_amount` domain
- Machine-readable JSON schema for every purchasable listing card
- Funding session and signed webhook reconciliation
- Escrow order state machine
- Delivery proof and dispute workflow
- Admin review queue for KYC, listings, deposits, and disputes
- Audit logs for financial and operator actions

## Frontend Added

- `app.html` product console
- `app.css` console styling
- `app.js` clickable sample data and navigation

The console is a static frontend prototype. It does not move money, store user data, or connect to Binance Pay yet.

## Backend Added

- `backend/schema.sql`: PostgreSQL schema blueprint
- `backend/migrations/202606050001_agentpay_initial_schema.sql`: migration-ready PostgreSQL baseline
- `backend/openapi.yaml`: API endpoint contract
- `backend/API_ROUTE_MAP.md`: route-by-route implementation map
- `backend/ESCROW_STATE_MACHINE.md`: escrow transition and ledger rules
- `backend/DEPLOYMENT_CHECKLIST.md`: backend deployment and launch gates
- `backend/mongo-listing-document.schema.json`: MongoDB discovery document schema
- `backend/mongo-listing-seed.json`: MongoDB discovery seed for visible marketplace cards
- `backend/listing-catalog.json`: visible listing catalog linking UI cards to PostgreSQL, MongoDB, and JSON Schema
- `backend/listing-schemas/`: machine-readable purchase requirement schemas for every console listing card
- `backend/migrations/202606050002_agentpay_visible_listing_seed.sql`: PostgreSQL seed for visible marketplace listings
- `backend/.env.example`: production environment template
- `backend-service/`: dependency-free Node.js backend starter with listing browse, signed starter agent requests, Binance Pay webhook signature verification, audit events, idempotent order creation, escrow transition enforcement, repository contracts, and unit tests
- `backend-service/src/repositories/`: Phase 5 PostgreSQL and MongoDB repository scaffolding with transaction-safe settlement SQL
- `backend-service/docs/PRODUCTION_API_SERVER.md`: API server deployment gate and production wiring order

## Database Boundary Rules

- Store all financial values in PostgreSQL as decimal strings mapped to `NUMERIC(36, 18)` through the `money_amount` domain.
- Keep marketplace discovery text, categories, merchant display data, and search terms in MongoDB.
- Keep orders, escrow state, deposits, wallet balances, ledger entries, disputes, and audit logs in PostgreSQL.
- Reference MongoDB listing documents from PostgreSQL through `mongo_listing_id`; do not settle against MongoDB-only data.
- Require every active listing to carry `schema_id` and `requirements_schema` so buyer agents can parse the purchase inputs before creating an order.

## Recommended Production Stack

- Frontend: Next.js or static export first
- Backend: Fastify or NestJS with TypeScript
- Settlement database: PostgreSQL
- Discovery database: MongoDB
- Queue: Redis + BullMQ
- ORM: Prisma or Drizzle
- Auth: JWT/session hybrid with MFA roadmap
- Payments: approved payment rail create-order flow plus verified webhooks
- Storage: S3-compatible object storage for delivery proof
- Monitoring: Sentry and structured audit logs

## Deployment Recommendation

Use Hostinger Cloud for the public site and static console preview. For the live backend, use either:

- Hostinger Cloud Node.js if the plan supports persistent Node runtime, environment variables, SSL, and database connectivity cleanly.
- Dedicated API server or managed backend if Redis workers, webhook processing, background reconciliation, and PostgreSQL management need stronger control.

## Compliance Position

The MVP should stay conservative:

- no token issuance
- no credit or lending
- no public crypto withdrawals in version one
- no fully automated dispute decisions
- no smart contracts before legal review
- low transaction limits until KYC and compliance rules are approved

## Next Build Step

After approval, harden `backend-service/` from starter into production service with:

1. auth routes
2. wallet and ledger service
3. funding service
4. agent policy engine
5. MongoDB listing discovery service and PostgreSQL order service
6. escrow state machine
7. admin review service
8. audit logging middleware
