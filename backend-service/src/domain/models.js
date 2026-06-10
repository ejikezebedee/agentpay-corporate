export const ROLES = Object.freeze({
  BUYER: "buyer",
  SELLER: "seller",
  ADMIN: "admin",
  SUPPORT: "support"
});

export const WALLET_ACCOUNT_TYPES = Object.freeze({
  AVAILABLE: "available",
  PENDING: "pending",
  ESCROW_LOCKED: "escrow_locked",
  PLATFORM_FEE: "platform_fee"
});

export const DEPOSIT_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected"
});

export const LISTING_STATUS = Object.freeze({
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  ACTIVE: "active",
  REJECTED: "rejected",
  PAUSED: "paused",
  SOLD_OUT: "sold_out",
  ARCHIVED: "archived"
});

export const PRODUCT_TYPES = Object.freeze({
  DIGITAL: "digital",
  PHYSICAL: "physical",
  SERVICE: "service"
});

export const DISCOUNT_TYPES = Object.freeze({
  NONE: "none",
  FIXED: "fixed",
  PERCENTAGE: "percentage"
});

export const MESSAGE_STATUS = Object.freeze({
  DRAFT: "draft",
  SENT: "sent",
  READ: "read",
  ARCHIVED: "archived",
  FAILED: "failed"
});

export const RELATED_ENTITY_TYPES = Object.freeze({
  LISTING: "listing",
  ORDER: "order",
  ESCROW: "escrow",
  DISPUTE: "dispute",
  WALLET: "wallet",
  ACCOUNT: "account",
  GENERAL: "general"
});

export const ESCROW_ORDER_STATUS = Object.freeze({
  CREATED: "created",
  FUNDED: "funded",
  AWAITING_DELIVERY: "awaiting_delivery",
  DELIVERED: "delivered",
  BUYER_CONFIRMED: "buyer_confirmed",
  DISPUTED: "disputed",
  RELEASED: "released",
  REFUNDED: "refunded",
  CANCELLED: "cancelled"
});

export const REVIEW_STATUS = Object.freeze({
  OPEN: "open",
  APPROVED: "approved",
  REJECTED: "rejected",
  RESOLVED: "resolved"
});

export const DISPUTE_STATUS = Object.freeze({
  OPENED: "opened",
  AWAITING_BUYER_RESPONSE: "awaiting_buyer_response",
  AWAITING_SELLER_RESPONSE: "awaiting_seller_response",
  EVIDENCE_SUBMITTED: "evidence_submitted",
  UNDER_REVIEW: "under_review",
  ESCALATED: "escalated",
  RESOLVED_REFUND_BUYER: "resolved_refund_buyer",
  RESOLVED_RELEASE_SELLER: "resolved_release_seller",
  RESOLVED_PARTIAL_REFUND: "resolved_partial_refund",
  REJECTED: "rejected",
  CLOSED: "closed"
});

export const DISPUTE_PRIORITY = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical"
});

export const DISPUTE_EVIDENCE_TYPES = Object.freeze({
  MESSAGE: "message",
  IMAGE: "image",
  DOCUMENT: "document",
  DELIVERY_PROOF: "delivery_proof",
  TRACKING: "tracking",
  DOWNLOAD_LOG: "download_log",
  OTHER: "other"
});
