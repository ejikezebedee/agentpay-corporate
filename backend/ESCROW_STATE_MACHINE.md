# AgentPay Escrow State Machine

## Goal

Escrow protects agent-to-agent purchases by reserving buyer funds before work starts and releasing or refunding funds only through auditable state transitions.

## States

| State | Meaning | Allowed Next States |
| --- | --- | --- |
| `created` | Order request exists, no funds locked yet. | `approved`, `cancelled` |
| `approved` | Policy checks passed and escrow lock can begin. | `escrow_locked`, `cancelled` |
| `escrow_locked` | Buyer wallet debited and escrow balance credited in PostgreSQL ledger. | `in_delivery`, `refunded`, `disputed` |
| `in_delivery` | Merchant has accepted or started fulfillment. | `delivered`, `disputed`, `refunded` |
| `delivered` | Merchant submitted delivery proof. | `released`, `disputed`, `refunded` |
| `released` | Escrow released to merchant and platform fee reserved. Terminal. | none |
| `refunded` | Escrow returned to buyer. Terminal. | none |
| `disputed` | Admin review required before release or refund. | `released`, `refunded` |
| `cancelled` | Order cancelled before escrow lock. Terminal. | none |

## Lock Escrow Transaction

1. Begin PostgreSQL transaction.
2. Lock buyer wallet row with `select ... for update`.
3. Confirm available balance is greater than or equal to order amount.
4. Insert order with `status = 'escrow_locked'`.
5. Decrease buyer `available_balance`.
6. Increase buyer `escrow_balance`.
7. Insert ledger entry with `entry_type = 'escrow_lock'` and debit equal to order amount.
8. Insert audit log with actor, subject, and idempotency key.
9. Commit transaction.

## Release Escrow Transaction

1. Begin PostgreSQL transaction.
2. Lock buyer wallet row and merchant wallet row.
3. Confirm order is `delivered` or `disputed` with approved admin resolution.
4. Move order to `released`.
5. Decrease buyer `escrow_balance`.
6. Increase merchant `available_balance` by net settlement amount.
7. Increase platform fee reserve when fee applies.
8. Insert ledger entries for `escrow_release` and `fee`.
9. Insert audit log.
10. Commit transaction.

## Refund Escrow Transaction

1. Begin PostgreSQL transaction.
2. Lock buyer wallet row.
3. Confirm order is `escrow_locked`, `in_delivery`, `delivered`, or `disputed`.
4. Move order to `refunded`.
5. Decrease buyer `escrow_balance`.
6. Increase buyer `available_balance`.
7. Insert ledger entry with `entry_type = 'refund'`.
8. Insert audit log.
9. Commit transaction.

## Non-Negotiable Rules

- Never release or refund from MongoDB data.
- Never mutate balances outside a PostgreSQL transaction.
- Never store amounts as float or double.
- Never accept a second order mutation with the same idempotency key.
- Never accept Binance Pay webhook data without signature verification.
- Never allow an agent to bypass owner limits, daily limits, paused status, or KYC tier checks.

## Review Gates

- High-value order: admin review.
- Unverified merchant: admin review.
- Delivery rejection: dispute review.
- Webhook amount mismatch: admin review.
- Duplicate idempotency key with changed payload: reject and audit.
