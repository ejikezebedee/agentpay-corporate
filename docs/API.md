# AgentPay API

Base URL for local development:

```text
http://127.0.0.1:3000
```

Admin routes use either the HTTP-only `agentpay_admin_session` cookie from `/api/auth/login` or `Authorization: Bearer <token>`.

## Auth

### POST `/api/auth/login`

Purpose: verify admin credentials and create an admin session.

Auth: none.

Request:

```json
{
  "username": "admin@zebepay.test",
  "password": "admin-demo-pass"
}
```

Response:

```json
{
  "token": "session-token",
  "admin": { "id": "usr_admin", "email": "admin@zebepay.test", "role": "Platform Admin" },
  "expires_in_seconds": 28800
}
```

### POST `/api/auth/logout`

Purpose: clear the admin cookie session.

Auth: admin.

Response:

```json
{ "ok": true }
```

### GET `/api/auth/session`

Purpose: return current admin session profile.

Auth: admin.

Response:

```json
{
  "admin": { "id": "usr_admin", "email": "admin@zebepay.test", "role": "Platform Admin" },
  "expires_at": "2026-06-10T18:00:00.000Z"
}
```

## Listings

### GET `/api/listings`

Purpose: list seller/admin marketplace listings. Add `?include_archived=true` for archived listings.

Auth: seller or admin.

Response:

```json
{ "items": [{ "id": "lst_demo_digital", "title": "Demo Digital Product", "status": "active" }] }
```

### GET `/api/listings/:id`

Purpose: read listing detail.

Auth: seller owner or admin.

### POST `/api/listings`

Purpose: create a product listing.

Auth: seller or admin.

Request:

```json
{
  "title": "Product title",
  "description": "Product description",
  "category": "Development",
  "productType": "digital",
  "price": "100.00",
  "currency": "USDT",
  "discountType": "percentage",
  "discountValue": "10",
  "stockQuantity": 100,
  "imageUrl": "",
  "digitalFileUrl": "private://file.zip",
  "deliveryInstructions": "Deliver after escrow approval.",
  "status": "draft"
}
```

Response:

```json
{
  "id": "listing-id",
  "title": "Product title",
  "price": "100.000000000000000000",
  "final_price": "90.000000000000000000",
  "status": "draft"
}
```

### PATCH `/api/listings/:id`

Purpose: edit listing fields.

Auth: seller owner or admin.

### PATCH `/api/listings/:id/status`

Purpose: change listing status.

Auth: seller owner or admin.

Request:

```json
{ "status": "paused" }
```

### PATCH `/api/listings/:id/discount`

Purpose: add, update, or remove discount.

Auth: seller owner or admin.

Request:

```json
{ "discountType": "fixed", "discountValue": "5.00" }
```

### DELETE `/api/listings/:id`

Purpose: archive listing by setting `status = archived`.

Auth: seller owner or admin.

## Disputes

### GET `/api/disputes`

Purpose: list all disputes for admin/support.

Auth: admin or support.

### GET `/api/disputes/:id`

Purpose: open dispute detail with evidence and timeline.

Auth: admin/support, or related buyer/seller.

### POST `/api/disputes`

Purpose: create a dispute record.

Auth: admin or support.

Request:

```json
{
  "orderId": "AP-ORD-1048",
  "escrowOrderId": "esc_demo_order",
  "listingId": "lst_demo_digital",
  "buyerUserId": "usr_buyer",
  "sellerUserId": "usr_seller",
  "reason": "Delivery could not be verified.",
  "buyerClaim": "Download failed.",
  "sellerResponse": "",
  "disputedAmount": "48.00",
  "currency": "USDT",
  "priority": "high"
}
```

### PATCH `/api/disputes/:id/status`

Purpose: controlled status transition.

Auth: admin or support.

Request:

```json
{ "status": "under_review" }
```

### POST `/api/disputes/:id/message`

Purpose: send an internal dispute message. Messages are stored with `related_entity_type = dispute`.

Auth: admin or support.

Request:

```json
{
  "recipientRole": "buyer",
  "subject": "Please provide more evidence",
  "body": "Please upload screenshots or delivery logs."
}
```

### POST `/api/disputes/:id/request-evidence`

Purpose: request buyer or seller evidence.

Auth: admin or support.

Request:

```json
{ "requiredFrom": "buyer" }
```

### POST `/api/disputes/:id/admin-note`

Purpose: add internal admin note.

Auth: admin or support.

Request:

```json
{ "note": "Review delivery proof before deciding." }
```

### POST `/api/disputes/:id/refund`

Purpose: refund full locked escrow amount to buyer available wallet.

Auth: admin or support.

Headers:

```text
Idempotency-Key: refund-case-0001
```

### POST `/api/disputes/:id/release`

Purpose: release full locked escrow amount to seller available wallet.

Auth: admin or support.

Headers:

```text
Idempotency-Key: release-case-0001
```

### POST `/api/disputes/:id/partial-refund`

Purpose: split locked escrow between buyer refund and seller release.

Auth: admin or support.

Headers:

```text
Idempotency-Key: split-case-0001
```

Request:

```json
{ "amount": "12.00" }
```

### POST `/api/disputes/:id/escalate`

Purpose: escalate dispute.

Auth: admin or support.

### POST `/api/disputes/:id/close`

Purpose: close dispute without money movement.

Auth: admin or support.

## Messages

General internal message routes still exist:

- `GET /api/users`
- `GET /api/messages`
- `GET /api/messages/:threadId`
- `POST /api/messages`
- `PATCH /api/messages/:id/read`
- `PATCH /api/messages/:id/archive`
- `POST /api/messages/announcement`

Stage B only requires dispute-connected messaging from `/api/disputes/:id/message`.

## Wallet and Audit

- `GET /api/v1/wallet/summary`: wallet balances by ledger account.
- `GET /api/v1/wallet/ledger`: immutable ledger history.
- `GET /api/v1/admin/audit-events`: admin audit feed.
- `GET /api/v1/admin/review-queue`: admin review queue.

## Future Binance Pay / Stage D

Existing scaffold:

- `POST /api/v1/webhooks/binance-pay`

Stage D still needs PaymentProvider abstraction, mock sandbox provider, Binance Pay checkout request flow, payment webhook records, reconciliation UI, and official production signature verification review against current Binance Pay documentation.
