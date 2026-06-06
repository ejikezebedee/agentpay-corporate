# AgentPay Phase 2 API Route Map

This route map defines the first backend implementation boundary. It is intentionally conservative: no route moves money until authentication, policy checks, idempotency, ledger writes, webhook verification, and audit logging are implemented.

## Auth

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/auth/signup` | Create a human-owned account. |
| POST | `/api/v1/auth/login` | Start authenticated user session. |
| POST | `/api/v1/auth/logout` | End user session. |
| GET | `/api/v1/me` | Return current user profile, KYC tier, and account status. |

## Agents

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/agents` | List human-owned buyer and merchant agents. |
| POST | `/api/v1/agents` | Register an agent with role, limits, and status. |
| PATCH | `/api/v1/agents/{agentId}` | Update limits, allowed scopes, and approval thresholds. |
| POST | `/api/v1/agents/{agentId}/pause` | Immediate kill switch for an agent. |
| POST | `/api/v1/agents/{agentId}/api-keys` | Issue scoped agent API key. |
| DELETE | `/api/v1/agents/{agentId}/api-keys/{keyId}` | Revoke scoped API key. |

## Marketplace

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/listings` | Search MongoDB discovery documents, then hydrate price and settlement fields from PostgreSQL. |
| GET | `/api/v1/listings/{publicSlug}` | Return one listing with JSON purchase schema. |
| POST | `/api/v1/listings` | Merchant submits listing for admin approval. |
| POST | `/api/v1/listings/{listingId}/submit-review` | Move draft listing to review queue. |

## Wallet And Deposits

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/wallet` | Return available, escrow, and fee-reserved balances. |
| GET | `/api/v1/wallet/ledger` | Return ledger entries for a wallet. |
| POST | `/api/v1/deposits/binance-pay` | Create Binance Pay funding session. |
| GET | `/api/v1/deposits/{depositId}` | Return funding/reconciliation status. |
| POST | `/api/v1/webhooks/binance-pay` | Verify Binance Pay webhook and reconcile deposit. |

## Agent Payment Requests

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/payment-requests` | Agent requests purchase authorization before order creation. |
| GET | `/api/v1/payment-requests/{requestId}` | Return approval, rejection, or human-review status. |
| POST | `/api/v1/payment-requests/{requestId}/approve` | Human owner approves a pending request. |
| POST | `/api/v1/payment-requests/{requestId}/reject` | Human owner rejects a pending request. |

## Orders And Escrow

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/v1/orders` | Create order, enforce idempotency, run agent policy, and lock escrow. |
| GET | `/api/v1/orders/{orderId}` | Return order status, escrow status, and delivery metadata. |
| POST | `/api/v1/orders/{orderId}/deliver` | Merchant submits delivery proof. |
| POST | `/api/v1/orders/{orderId}/release` | Buyer/admin releases escrow to merchant. |
| POST | `/api/v1/orders/{orderId}/refund` | Admin refunds escrow to buyer. |
| POST | `/api/v1/orders/{orderId}/dispute` | Buyer or merchant opens dispute. |

## Admin

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/v1/admin/reviews` | List KYC, listing, deposit, webhook, and dispute reviews. |
| POST | `/api/v1/admin/reviews/{reviewId}/approve` | Approve review subject. |
| POST | `/api/v1/admin/reviews/{reviewId}/reject` | Reject review subject with notes. |
| GET | `/api/v1/admin/audit-logs` | Read immutable audit trail. |

## Implementation Gates

- Every mutating route requires an idempotency strategy.
- Every money route writes to PostgreSQL inside a database transaction.
- Every payment amount remains a decimal string and maps to `NUMERIC(36,18)`.
- Listing search can read MongoDB, but order creation must hydrate and settle from PostgreSQL.
- Binance Pay webhook processing must verify signatures before writing deposit status.
