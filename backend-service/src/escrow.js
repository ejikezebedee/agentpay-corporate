export const ORDER_STATUS = Object.freeze({
  CREATED: "created",
  APPROVED: "approved",
  ESCROW_LOCKED: "escrow_locked",
  IN_DELIVERY: "in_delivery",
  DELIVERED: "delivered",
  RELEASED: "released",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  CANCELLED: "cancelled"
});

const TRANSITIONS = Object.freeze({
  approve: {
    from: [ORDER_STATUS.CREATED],
    to: ORDER_STATUS.APPROVED,
    ledger: []
  },
  lock_escrow: {
    from: [ORDER_STATUS.APPROVED],
    to: ORDER_STATUS.ESCROW_LOCKED,
    ledger: ["escrow_lock"]
  },
  start_delivery: {
    from: [ORDER_STATUS.ESCROW_LOCKED],
    to: ORDER_STATUS.IN_DELIVERY,
    ledger: []
  },
  deliver: {
    from: [ORDER_STATUS.IN_DELIVERY, ORDER_STATUS.ESCROW_LOCKED],
    to: ORDER_STATUS.DELIVERED,
    ledger: []
  },
  release: {
    from: [ORDER_STATUS.DELIVERED],
    to: ORDER_STATUS.RELEASED,
    ledger: ["escrow_release"]
  },
  refund: {
    from: [ORDER_STATUS.ESCROW_LOCKED, ORDER_STATUS.IN_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.DISPUTED],
    to: ORDER_STATUS.REFUNDED,
    ledger: ["refund"]
  },
  dispute: {
    from: [ORDER_STATUS.ESCROW_LOCKED, ORDER_STATUS.IN_DELIVERY, ORDER_STATUS.DELIVERED],
    to: ORDER_STATUS.DISPUTED,
    ledger: []
  },
  cancel: {
    from: [ORDER_STATUS.CREATED, ORDER_STATUS.APPROVED],
    to: ORDER_STATUS.CANCELLED,
    ledger: []
  }
});

export function transitionOrder(order, action) {
  const rule = TRANSITIONS[action];
  if (!rule) {
    throw new Error(`Unknown escrow action: ${action}`);
  }

  if (!rule.from.includes(order.status)) {
    throw new Error(`Cannot ${action} order from ${order.status}`);
  }

  return {
    ...order,
    status: rule.to,
    ledgerEffects: rule.ledger,
    updated_at: new Date().toISOString()
  };
}
