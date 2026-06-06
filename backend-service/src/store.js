import { randomUUID } from "node:crypto";
import { normalizeMoneyString } from "./money.js";
import { ORDER_STATUS } from "./escrow.js";

const orders = new Map();
const idempotency = new Map();

export function createOrder({ listing, buyerUserId, buyerAgentId, idempotencyKey, requestPayload }) {
  if (!idempotencyKey || idempotencyKey.length < 12) {
    throw new Error("Idempotency-Key header is required and must be at least 12 characters");
  }

  const idempotencyScope = `${buyerUserId}:${idempotencyKey}`;
  const existingId = idempotency.get(idempotencyScope);
  if (existingId) {
    return {
      order: orders.get(existingId),
      reused: true
    };
  }

  const order = {
    id: randomUUID(),
    listing_id: listing.id,
    buyer_user_id: buyerUserId,
    buyer_agent_id: buyerAgentId || null,
    amount: normalizeMoneyString(listing.price, "listing.price"),
    currency: listing.currency,
    status: ORDER_STATUS.CREATED,
    request_payload: requestPayload || {},
    delivery_artifact: listing.delivery_artifact || null,
    delivery_proof: null,
    created_at: new Date().toISOString()
  };

  orders.set(order.id, order);
  idempotency.set(idempotencyScope, order.id);

  return {
    order,
    reused: false
  };
}

export function getOrder(orderId) {
  return orders.get(orderId);
}

export function saveOrder(order) {
  orders.set(order.id, order);
  return order;
}
