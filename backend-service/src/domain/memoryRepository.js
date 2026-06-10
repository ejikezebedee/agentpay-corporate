import { randomUUID } from "node:crypto";
import { normalizeMoneyString } from "../money.js";
import { DEPOSIT_STATUS, DISCOUNT_TYPES, DISPUTE_EVIDENCE_TYPES, DISPUTE_PRIORITY, DISPUTE_STATUS, ESCROW_ORDER_STATUS, LISTING_STATUS, MESSAGE_STATUS, PRODUCT_TYPES, RELATED_ENTITY_TYPES, REVIEW_STATUS, ROLES, WALLET_ACCOUNT_TYPES } from "./models.js";

const ZERO = "0.000000000000000000";

function moneyToBigInt(value) {
  const normalized = normalizeMoneyString(value, "amount");
  const [whole, fraction] = normalized.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt(fraction);
}

function bigIntToMoney(value) {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 10n ** 18n;
  const fraction = String(absolute % 10n ** 18n).padStart(18, "0");
  return `${sign}${whole}.${fraction}`;
}

function addMoney(left, right) {
  return bigIntToMoney(moneyToBigInt(left) + moneyToBigInt(right));
}

function subtractMoney(left, right) {
  return bigIntToMoney(moneyToBigInt(left) - moneyToBigInt(right));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertNonEmptyString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function assertEnum(value, allowed, field) {
  if (!Object.values(allowed).includes(value)) {
    throw new Error(`${field} is invalid`);
  }
  return value;
}

function normalizeTextLength(value, field, { min = 1, max = 500 } = {}) {
  const text = assertNonEmptyString(value, field);
  if (text.length < min || text.length > max) {
    throw new Error(`${field} must be between ${min} and ${max} characters`);
  }
  return text;
}

function calculateDiscount({ price, discountType = DISCOUNT_TYPES.NONE, discountValue = "0" }) {
  const priceUnits = moneyToBigInt(price);
  const normalizedDiscountValue = normalizeMoneyString(String(discountValue || "0"), "discount.value");
  const discountUnits = moneyToBigInt(normalizedDiscountValue);
  let finalUnits = priceUnits;

  if (discountType === DISCOUNT_TYPES.FIXED) {
    finalUnits = priceUnits - discountUnits;
  }

  if (discountType === DISCOUNT_TYPES.PERCENTAGE) {
    if (discountUnits <= 0n || discountUnits >= moneyToBigInt("100")) {
      throw new Error("Percentage discount must be between 1 and 99");
    }
    finalUnits = priceUnits - ((priceUnits * discountUnits) / moneyToBigInt("100"));
  }

  if (finalUnits <= 0n) {
    throw new Error("Discount must leave a final price greater than zero");
  }

  return {
    discount_value: normalizedDiscountValue,
    final_price: bigIntToMoney(finalUnits)
  };
}

export function validateListingInput(input, { partial = false } = {}) {
  const output = {};

  if (!partial || input.title !== undefined) output.title = assertNonEmptyString(input.title, "Product title");
  if (!partial || input.description !== undefined) output.description = assertNonEmptyString(input.description, "Product description");
  if (!partial || input.category !== undefined) output.category = assertNonEmptyString(input.category, "Product category");
  if (!partial || input.productType !== undefined || input.product_type !== undefined) {
    output.product_type = assertEnum(input.productType || input.product_type, PRODUCT_TYPES, "Product type");
  }
  if (!partial || input.price !== undefined) output.price = normalizeMoneyString(String(input.price), "price");
  if (!partial || input.currency !== undefined) output.currency = assertNonEmptyString(input.currency || "USDT", "Currency").toUpperCase();

  if (!partial || input.discountType !== undefined || input.discount_type !== undefined) {
    output.discount_type = assertEnum(input.discountType || input.discount_type || DISCOUNT_TYPES.NONE, DISCOUNT_TYPES, "Discount type");
  }

  if (!partial || input.discountValue !== undefined || input.discount_value !== undefined) {
    output.discount_value = normalizeMoneyString(String(input.discountValue || input.discount_value || "0"), "discount.value");
  }

  if (!partial || input.imageUrl !== undefined || input.image_url !== undefined) output.image_url = String(input.imageUrl || input.image_url || "");
  if (!partial || input.digitalFileUrl !== undefined || input.digital_file_url !== undefined) output.digital_file_url = String(input.digitalFileUrl || input.digital_file_url || "");
  if (!partial || input.deliveryInstructions !== undefined || input.delivery_instructions !== undefined) {
    output.delivery_instructions = String(input.deliveryInstructions || input.delivery_instructions || "");
  }

  if (!partial || input.stockQuantity !== undefined || input.stock_quantity !== undefined) {
    const quantity = Number(input.stockQuantity ?? input.stock_quantity ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Stock quantity must be a non-negative integer");
    output.stock_quantity = quantity;
  }

  if (!partial || input.status !== undefined) {
    output.status = assertEnum(input.status || LISTING_STATUS.DRAFT, LISTING_STATUS, "Listing status");
  }

  const priceForDiscount = output.price || input.currentPrice || input.price;
  const discountType = output.discount_type || input.currentDiscountType || input.discount_type || input.discountType || DISCOUNT_TYPES.NONE;
  const discountValue = output.discount_value || input.currentDiscountValue || input.discount_value || input.discountValue || "0";
  if (priceForDiscount && (output.price || output.discount_type || output.discount_value || !partial)) {
    const discount = calculateDiscount({ price: priceForDiscount, discountType, discountValue });
    output.discount_value = discount.discount_value;
    output.final_price = discount.final_price;
  }

  return output;
}

export function validateMessageInput(input) {
  return {
    recipient_user_id: assertNonEmptyString(input.recipientUserId || input.recipient_user_id, "Recipient user"),
    related_entity_type: assertEnum(input.relatedEntityType || input.related_entity_type || RELATED_ENTITY_TYPES.GENERAL, RELATED_ENTITY_TYPES, "Related entity type"),
    related_entity_id: String(input.relatedEntityId || input.related_entity_id || ""),
    subject: normalizeTextLength(input.subject, "Message subject", { min: 1, max: 140 }),
    body: normalizeTextLength(input.body, "Message body", { min: 1, max: 5000 }),
    status: assertEnum(input.status || MESSAGE_STATUS.SENT, MESSAGE_STATUS, "Message status")
  };
}

export class MemoryAgentPayRepository {
  constructor({ now = () => new Date(), id = () => randomUUID() } = {}) {
    this.now = now;
    this.id = id;
    this.reset();
  }

  reset() {
    this.users = new Map();
    this.wallets = new Map();
    this.walletAccounts = new Map();
    this.ledgerEntries = new Map();
    this.ledgerIdempotency = new Map();
    this.deposits = new Map();
    this.depositIdempotency = new Map();
    this.depositWebhookIdempotency = new Map();
    this.listings = new Map();
    this.escrowOrders = new Map();
    this.adminReviews = new Map();
    this.auditEvents = new Map();
    this.messageThreads = new Map();
    this.messages = new Map();
    this.messageRateLimit = new Map();
    this.disputes = new Map();
    this.disputeEvidence = new Map();
    this.disputeTimeline = new Map();
    this.disputeResolutionIdempotency = new Map();
    this.seed();
  }

  seed() {
    const admin = this.createUser({ id: "usr_admin", email: "admin@zebepay.test", displayName: "AgentPay Admin", role: ROLES.ADMIN });
    const buyer = this.createUser({ id: "usr_buyer", email: "buyer@zebepay.test", displayName: "Buyer Account", role: ROLES.BUYER });
    const seller = this.createUser({ id: "usr_seller", email: "seller@zebepay.test", displayName: "Seller Account", role: ROLES.SELLER });
    this.createUser({ id: "usr_support", email: "support@zebepay.test", displayName: "Support Account", role: ROLES.SUPPORT });

    this.createWallet({ id: "wal_buyer_usdt", userId: buyer.id, currency: "USDT" });
    this.createWallet({ id: "wal_seller_usdt", userId: seller.id, currency: "USDT" });
    this.createWallet({ id: "wal_admin_usdt", userId: admin.id, currency: "USDT" });

    this.createListing({
      id: "lst_demo_digital",
      sellerUserId: seller.id,
      title: "AgentPay Integration Pack",
      description: "Downloadable starter package for integration testing.",
      productType: "digital",
      category: "Development",
      price: "48.00",
      currency: "USDT",
      discountType: DISCOUNT_TYPES.PERCENTAGE,
      discountValue: "10",
      stockQuantity: 100,
      imageUrl: "",
      digitalFileUrl: "private://demo-digital-product.zip",
      deliveryInstructions: "Download becomes available after escrow rules allow delivery.",
      status: LISTING_STATUS.ACTIVE
    });

    this.createListing({
      id: "lst_demo_physical",
      sellerUserId: seller.id,
      title: "Merchant Hardware Kit",
      description: "Physical onboarding kit for enterprise deployment pilots.",
      productType: "physical",
      category: "Hardware",
      price: "120.00",
      currency: "USDT",
      discountType: DISCOUNT_TYPES.NONE,
      discountValue: "0",
      stockQuantity: 12,
      imageUrl: "",
      digitalFileUrl: "",
      deliveryInstructions: "Ships after payment review and address confirmation.",
      status: LISTING_STATUS.PENDING_REVIEW
    });

    const escrowOrder = this.createEscrowOrder({
      id: "esc_demo_order",
      listingId: "lst_demo_digital",
      buyerUserId: buyer.id,
      sellerUserId: seller.id,
      amount: "48.00",
      currency: "USDT",
      status: ESCROW_ORDER_STATUS.DISPUTED
    });
    this.appendLedgerEntry({
      creditAccountId: this.getWalletAccount(buyer.id, "USDT", WALLET_ACCOUNT_TYPES.AVAILABLE).id,
      amount: "48.00",
      currency: "USDT",
      idempotencyKey: "seed:buyer:escrow:fund",
      entryType: "seed_credit",
      entityType: "wallet",
      entityId: buyer.id
    });
    this.appendLedgerEntry({
      debitAccountId: this.getWalletAccount(buyer.id, "USDT", WALLET_ACCOUNT_TYPES.AVAILABLE).id,
      creditAccountId: this.getWalletAccount(buyer.id, "USDT", WALLET_ACCOUNT_TYPES.ESCROW_LOCKED).id,
      amount: "48.00",
      currency: "USDT",
      idempotencyKey: "seed:buyer:escrow:lock",
      entryType: "escrow_lock",
      entityType: "escrow_order",
      entityId: escrowOrder.id
    });
    this.createDispute({
      id: "dsp_demo_order",
      orderId: "AP-ORD-1048",
      escrowOrderId: escrowOrder.id,
      listingId: "lst_demo_digital",
      buyerUserId: buyer.id,
      sellerUserId: seller.id,
      reason: "Buyer reports that the delivered archive could not be opened.",
      buyerClaim: "The delivered file link failed during download verification.",
      sellerResponse: "Seller says the delivery proof shows a successful private upload.",
      disputedAmount: "48.00",
      currency: "USDT",
      priority: DISPUTE_PRIORITY.HIGH,
      status: DISPUTE_STATUS.OPENED
    });

    this.createAdminReview({
      id: "rev_demo_listing",
      subjectType: "listing",
      subjectId: "lst_demo_physical",
      priority: "normal",
      status: REVIEW_STATUS.OPEN,
      notes: "Review physical listing before public activation."
    });

    this.appendAuditEvent({
      actorUserId: admin.id,
      actorRole: ROLES.ADMIN,
      action: "seed.created",
      entityType: "system",
      entityId: "stage1",
      metadata: { scope: "stage_1_domain_repository" }
    });

    this.createMessage({
      senderUserId: admin.id,
      recipientUserId: seller.id,
      subject: "Listing approved",
      body: "Your digital product is ready for marketplace publishing.",
      relatedEntityType: RELATED_ENTITY_TYPES.LISTING,
      relatedEntityId: "lst_demo_digital"
    });
  }

  createUser({ id = this.id(), email, displayName, role, status = "active" }) {
    const user = { id, email, display_name: displayName, role, status, created_at: this.now().toISOString() };
    this.users.set(user.id, user);
    return clone(user);
  }

  findUserByEmail(email) {
    return clone([...this.users.values()].find((user) => user.email === email) || null);
  }

  getUser(userId) {
    return clone(this.users.get(userId) || null);
  }

  listUsers() {
    return [...this.users.values()].map(clone);
  }

  createWallet({ id = this.id(), userId, currency }) {
    const wallet = { id, user_id: userId, currency, status: "active", created_at: this.now().toISOString() };
    this.wallets.set(wallet.id, wallet);
    Object.values(WALLET_ACCOUNT_TYPES).forEach((type) => {
      const account = {
        id: `${wallet.id}:${type}`,
        wallet_id: wallet.id,
        user_id: userId,
        currency,
        account_type: type,
        created_at: wallet.created_at
      };
      this.walletAccounts.set(account.id, account);
    });
    return clone(wallet);
  }

  getWalletByUserAndCurrency(userId, currency = "USDT") {
    return clone([...this.wallets.values()].find((wallet) => wallet.user_id === userId && wallet.currency === currency) || null);
  }

  requireWallet(userId, currency = "USDT") {
    const wallet = this.getWalletByUserAndCurrency(userId, currency);
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  getWalletAccount(userId, currency, accountType) {
    const wallet = this.requireWallet(userId, currency);
    const account = this.walletAccounts.get(`${wallet.id}:${accountType}`);
    if (!account) throw new Error(`Wallet account not found: ${accountType}`);
    return account;
  }

  getAccountBalance(accountId) {
    let balance = 0n;
    for (const entry of this.ledgerEntries.values()) {
      if (entry.debit_account_id === accountId) balance -= moneyToBigInt(entry.amount);
      if (entry.credit_account_id === accountId) balance += moneyToBigInt(entry.amount);
    }
    return bigIntToMoney(balance);
  }

  getWalletSummary(userId, currency = "USDT") {
    const wallet = this.requireWallet(userId, currency);
    const accounts = Object.values(WALLET_ACCOUNT_TYPES).reduce((result, accountType) => {
      const account = this.getWalletAccount(userId, currency, accountType);
      result[accountType] = this.getAccountBalance(account.id);
      return result;
    }, {});
    return { wallet, currency, accounts };
  }

  listLedgerEntries(userId, currency = "USDT") {
    const wallet = this.requireWallet(userId, currency);
    const accountIds = new Set([...this.walletAccounts.values()].filter((account) => account.wallet_id === wallet.id).map((account) => account.id));
    return [...this.ledgerEntries.values()]
      .filter((entry) => accountIds.has(entry.debit_account_id) || accountIds.has(entry.credit_account_id))
      .map(clone);
  }

  appendLedgerEntry({ debitAccountId = null, creditAccountId = null, amount, currency, idempotencyKey, entryType, entityType, entityId, metadata = {} }) {
    if (!idempotencyKey || idempotencyKey.length < 8) {
      throw new Error("Ledger idempotency key is required");
    }

    const existingId = this.ledgerIdempotency.get(idempotencyKey);
    if (existingId) {
      return { entry: clone(this.ledgerEntries.get(existingId)), reused: true };
    }

    const normalizedAmount = normalizeMoneyString(amount, "ledger.amount");
    if (moneyToBigInt(normalizedAmount) <= 0n) {
      throw new Error("Ledger amount must be greater than zero");
    }

    if (debitAccountId) {
      const nextBalance = moneyToBigInt(this.getAccountBalance(debitAccountId)) - moneyToBigInt(normalizedAmount);
      if (nextBalance < 0n) {
        throw new Error("Insufficient funds for ledger movement");
      }
    }

    const entry = Object.freeze({
      id: this.id(),
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      amount: normalizedAmount,
      currency,
      entry_type: entryType,
      entity_type: entityType,
      entity_id: entityId,
      idempotency_key: idempotencyKey,
      metadata,
      created_at: this.now().toISOString()
    });

    this.ledgerEntries.set(entry.id, entry);
    this.ledgerIdempotency.set(idempotencyKey, entry.id);
    return { entry: clone(entry), reused: false };
  }

  createDeposit({ userId, amount, currency = "USDT", provider = "mock_sandbox", idempotencyKey }) {
    if (!idempotencyKey || idempotencyKey.length < 8) {
      throw new Error("Deposit idempotency key is required");
    }

    const existingId = this.depositIdempotency.get(`${userId}:${idempotencyKey}`);
    if (existingId) return { deposit: clone(this.deposits.get(existingId)), reused: true };

    this.requireWallet(userId, currency);
    const deposit = {
      id: this.id(),
      user_id: userId,
      amount: normalizeMoneyString(amount, "deposit.amount"),
      currency,
      provider,
      status: DEPOSIT_STATUS.PENDING,
      idempotency_key: idempotencyKey,
      provider_reference: `mock_${this.id()}`,
      created_at: this.now().toISOString(),
      confirmed_at: null
    };

    this.deposits.set(deposit.id, deposit);
    this.depositIdempotency.set(`${userId}:${idempotencyKey}`, deposit.id);
    return { deposit: clone(deposit), reused: false };
  }

  confirmDeposit({ depositId, webhookIdempotencyKey }) {
    if (!webhookIdempotencyKey || webhookIdempotencyKey.length < 8) {
      throw new Error("Webhook idempotency key is required");
    }

    const existingDepositId = this.depositWebhookIdempotency.get(webhookIdempotencyKey);
    if (existingDepositId) {
      return { deposit: clone(this.deposits.get(existingDepositId)), reused: true };
    }

    const deposit = this.deposits.get(depositId);
    if (!deposit) throw new Error("Deposit not found");
    if (deposit.status === DEPOSIT_STATUS.CONFIRMED) {
      this.depositWebhookIdempotency.set(webhookIdempotencyKey, deposit.id);
      return { deposit: clone(deposit), reused: true };
    }

    const account = this.getWalletAccount(deposit.user_id, deposit.currency, WALLET_ACCOUNT_TYPES.AVAILABLE);
    this.appendLedgerEntry({
      creditAccountId: account.id,
      amount: deposit.amount,
      currency: deposit.currency,
      idempotencyKey: `deposit:${deposit.id}:credit`,
      entryType: "deposit_credit",
      entityType: "deposit",
      entityId: deposit.id,
      metadata: { provider: deposit.provider }
    });

    deposit.status = DEPOSIT_STATUS.CONFIRMED;
    deposit.confirmed_at = this.now().toISOString();
    this.depositWebhookIdempotency.set(webhookIdempotencyKey, deposit.id);
    return { deposit: clone(deposit), reused: false };
  }

  createListing(input) {
    const sellerUserId = input.sellerUserId || input.seller_user_id;
    const validated = validateListingInput(input);
    const listing = {
      id: input.id || this.id(),
      seller_user_id: sellerUserId,
      ...validated,
      created_at: this.now().toISOString()
    };
    this.listings.set(listing.id, listing);
    return clone(listing);
  }

  listListings({ includeArchived = false, sellerUserId = null } = {}) {
    return [...this.listings.values()]
      .filter((listing) => includeArchived || listing.status !== LISTING_STATUS.ARCHIVED)
      .filter((listing) => !sellerUserId || listing.seller_user_id === sellerUserId)
      .map(clone);
  }

  getListing(listingId) {
    return clone(this.listings.get(listingId) || null);
  }

  updateListing({ listingId, updates }) {
    const listing = this.listings.get(listingId);
    if (!listing) throw new Error("Listing not found");

    const validated = validateListingInput({
      ...updates,
      currentPrice: listing.price,
      currentDiscountType: listing.discount_type,
      currentDiscountValue: listing.discount_value
    }, { partial: true });

    const updated = {
      ...listing,
      ...validated,
      updated_at: this.now().toISOString()
    };
    this.listings.set(listingId, updated);
    return clone(updated);
  }

  archiveListing(listingId) {
    return this.updateListing({ listingId, updates: { status: LISTING_STATUS.ARCHIVED } });
  }

  updateListingStatus({ listingId, status }) {
    return this.updateListing({ listingId, updates: { status } });
  }

  updateListingDiscount({ listingId, discountType, discountValue }) {
    return this.updateListing({ listingId, updates: { discountType, discountValue } });
  }

  createEscrowOrder({ id = this.id(), listingId, buyerUserId, sellerUserId, amount, currency, status }) {
    const order = {
      id,
      listing_id: listingId,
      buyer_user_id: buyerUserId,
      seller_user_id: sellerUserId,
      amount: normalizeMoneyString(amount, "escrow.amount"),
      currency,
      status,
      created_at: this.now().toISOString()
    };
    this.escrowOrders.set(order.id, order);
    return clone(order);
  }

  getEscrowOrder(orderId) {
    return clone(this.escrowOrders.get(orderId) || null);
  }

  updateEscrowOrderStatus(orderId, status) {
    const order = this.escrowOrders.get(orderId);
    if (!order) throw new Error("Escrow order not found");
    order.status = status;
    order.updated_at = this.now().toISOString();
    return clone(order);
  }

  createDispute(input) {
    const reason = assertNonEmptyString(input.reason, "Dispute reason");
    const dispute = {
      id: input.id || this.id(),
      order_id: input.orderId || input.order_id,
      escrow_order_id: assertNonEmptyString(input.escrowOrderId || input.escrow_order_id, "Escrow order"),
      listing_id: assertNonEmptyString(input.listingId || input.listing_id, "Listing"),
      buyer_user_id: assertNonEmptyString(input.buyerUserId || input.buyer_user_id, "Buyer user"),
      seller_user_id: assertNonEmptyString(input.sellerUserId || input.seller_user_id, "Seller user"),
      assigned_admin_user_id: input.assignedAdminUserId || input.assigned_admin_user_id || null,
      reason,
      buyer_claim: String(input.buyerClaim || input.buyer_claim || ""),
      seller_response: String(input.sellerResponse || input.seller_response || ""),
      disputed_amount: normalizeMoneyString(input.disputedAmount || input.disputed_amount, "dispute.amount"),
      currency: assertNonEmptyString(input.currency || "USDT", "Currency").toUpperCase(),
      priority: assertEnum(input.priority || DISPUTE_PRIORITY.NORMAL, DISPUTE_PRIORITY, "Dispute priority"),
      status: assertEnum(input.status || DISPUTE_STATUS.OPENED, DISPUTE_STATUS, "Dispute status"),
      resolution_type: null,
      resolution_amount: null,
      admin_note: "",
      evidence_required_from: null,
      created_at: this.now().toISOString(),
      updated_at: this.now().toISOString(),
      resolved_at: null,
      closed_at: null
    };
    if (!this.escrowOrders.has(dispute.escrow_order_id)) throw new Error("Escrow order not found");
    this.disputes.set(dispute.id, dispute);
    this.addDisputeTimeline({
      disputeId: dispute.id,
      actorUserId: input.actorUserId || null,
      actorRole: input.actorRole || "system",
      action: "dispute_opened",
      message: reason
    });
    return clone(dispute);
  }

  listDisputes({ userId = null, role = null } = {}) {
    return [...this.disputes.values()]
      .filter((dispute) => !userId || [ROLES.ADMIN, ROLES.SUPPORT].includes(role) || dispute.buyer_user_id === userId || dispute.seller_user_id === userId)
      .map((dispute) => this.decorateDispute(dispute));
  }

  getDispute(disputeId, { userId = null, role = null } = {}) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) return null;
    if (userId && ![ROLES.ADMIN, ROLES.SUPPORT].includes(role) && dispute.buyer_user_id !== userId && dispute.seller_user_id !== userId) {
      throw new Error("Cannot access unrelated dispute");
    }
    return this.decorateDispute(dispute);
  }

  decorateDispute(dispute) {
    const listing = this.listings.get(dispute.listing_id);
    const buyer = this.users.get(dispute.buyer_user_id);
    const seller = this.users.get(dispute.seller_user_id);
    const escrow = this.escrowOrders.get(dispute.escrow_order_id);
    return clone({
      ...dispute,
      listing_title: listing?.title || dispute.listing_id,
      buyer_email: buyer?.email || dispute.buyer_user_id,
      seller_email: seller?.email || dispute.seller_user_id,
      escrow_status: escrow?.status || "unknown",
      evidence: [...this.disputeEvidence.values()].filter((item) => item.dispute_id === dispute.id),
      timeline: [...this.disputeTimeline.values()].filter((item) => item.dispute_id === dispute.id)
    });
  }

  addDisputeTimeline({ disputeId, actorUserId = null, actorRole = "system", action, message = "", metadata = {} }) {
    const item = {
      id: this.id(),
      dispute_id: disputeId,
      actor_user_id: actorUserId,
      actor_role: actorRole,
      action,
      message,
      metadata,
      created_at: this.now().toISOString()
    };
    this.disputeTimeline.set(item.id, item);
    return clone(item);
  }

  updateDisputeStatus({ disputeId, status, actorUserId, actorRole, message = "" }) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    if (this.isDisputeResolved(dispute)) throw new Error("Resolved or closed disputes cannot be changed");
    const nextStatus = assertEnum(status, DISPUTE_STATUS, "Dispute status");
    dispute.status = nextStatus;
    dispute.updated_at = this.now().toISOString();
    if ([DISPUTE_STATUS.CLOSED, DISPUTE_STATUS.REJECTED].includes(nextStatus)) {
      dispute.closed_at = this.now().toISOString();
    }
    this.addDisputeTimeline({ disputeId, actorUserId, actorRole, action: "dispute_status_changed", message: message || `Status changed to ${nextStatus}` });
    return this.decorateDispute(dispute);
  }

  addDisputeEvidence({ disputeId, uploadedByUserId, uploadedByRole, evidenceType = DISPUTE_EVIDENCE_TYPES.OTHER, title, description, fileUrlOrStorageKey = "" }) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    const evidence = {
      id: this.id(),
      dispute_id: disputeId,
      uploaded_by_user_id: uploadedByUserId,
      uploaded_by_role: uploadedByRole,
      evidence_type: assertEnum(evidenceType, DISPUTE_EVIDENCE_TYPES, "Evidence type"),
      title: assertNonEmptyString(title, "Evidence title"),
      description: normalizeTextLength(description, "Evidence description", { min: 1, max: 1000 }),
      file_url_or_storage_key: String(fileUrlOrStorageKey || ""),
      created_at: this.now().toISOString()
    };
    this.disputeEvidence.set(evidence.id, evidence);
    dispute.status = DISPUTE_STATUS.EVIDENCE_SUBMITTED;
    dispute.updated_at = this.now().toISOString();
    this.addDisputeTimeline({ disputeId, actorUserId: uploadedByUserId, actorRole: uploadedByRole, action: "dispute_evidence_added", message: evidence.title });
    return clone(evidence);
  }

  addDisputeAdminNote({ disputeId, actorUserId, actorRole, note }) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    const text = normalizeTextLength(note, "Admin note", { min: 1, max: 2000 });
    dispute.admin_note = text;
    dispute.updated_at = this.now().toISOString();
    this.addDisputeTimeline({ disputeId, actorUserId, actorRole, action: "dispute_admin_note_added", message: text });
    return this.decorateDispute(dispute);
  }

  requestDisputeEvidence({ disputeId, actorUserId, actorRole, requiredFrom }) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    if (!["buyer", "seller"].includes(requiredFrom)) throw new Error("Evidence can be requested from buyer or seller");
    dispute.evidence_required_from = requiredFrom;
    dispute.status = requiredFrom === "buyer" ? DISPUTE_STATUS.AWAITING_BUYER_RESPONSE : DISPUTE_STATUS.AWAITING_SELLER_RESPONSE;
    dispute.updated_at = this.now().toISOString();
    this.addDisputeTimeline({ disputeId, actorUserId, actorRole, action: "dispute_evidence_requested", message: `Evidence requested from ${requiredFrom}` });
    return this.decorateDispute(dispute);
  }

  isDisputeResolved(dispute) {
    return Boolean(dispute.resolved_at || dispute.closed_at || [
      DISPUTE_STATUS.RESOLVED_REFUND_BUYER,
      DISPUTE_STATUS.RESOLVED_RELEASE_SELLER,
      DISPUTE_STATUS.RESOLVED_PARTIAL_REFUND,
      DISPUTE_STATUS.REJECTED,
      DISPUTE_STATUS.CLOSED
    ].includes(dispute.status));
  }

  resolveDispute({ disputeId, resolutionType, actorUserId, actorRole, idempotencyKey, amount = null }) {
    if (!idempotencyKey || idempotencyKey.length < 8) throw new Error("Resolution idempotency key is required");
    const existingDisputeId = this.disputeResolutionIdempotency.get(idempotencyKey);
    if (existingDisputeId) {
      const existing = this.disputes.get(existingDisputeId);
      this.addDisputeTimeline({ disputeId: existingDisputeId, actorUserId, actorRole, action: "duplicate_dispute_resolution_rejected", message: "Duplicate resolution ignored" });
      return { dispute: this.decorateDispute(existing), reused: true };
    }

    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error("Dispute not found");
    if (this.isDisputeResolved(dispute)) throw new Error("Refund/release cannot happen if dispute is resolved or closed");
    const escrow = this.escrowOrders.get(dispute.escrow_order_id);
    if (!escrow) throw new Error("Escrow order not found");
    const buyerEscrowAccount = this.getWalletAccount(dispute.buyer_user_id, dispute.currency, WALLET_ACCOUNT_TYPES.ESCROW_LOCKED);
    const buyerAvailableAccount = this.getWalletAccount(dispute.buyer_user_id, dispute.currency, WALLET_ACCOUNT_TYPES.AVAILABLE);
    const sellerAvailableAccount = this.getWalletAccount(dispute.seller_user_id, dispute.currency, WALLET_ACCOUNT_TYPES.AVAILABLE);
    const fullAmount = dispute.disputed_amount;
    let action = "dispute_closed";

    if (resolutionType === "refund") {
      this.appendLedgerEntry({
        debitAccountId: buyerEscrowAccount.id,
        creditAccountId: buyerAvailableAccount.id,
        amount: fullAmount,
        currency: dispute.currency,
        idempotencyKey: `${idempotencyKey}:refund`,
        entryType: "dispute_refund",
        entityType: "dispute",
        entityId: dispute.id
      });
      dispute.status = DISPUTE_STATUS.RESOLVED_REFUND_BUYER;
      dispute.resolution_type = "refund_buyer";
      dispute.resolution_amount = fullAmount;
      escrow.status = ESCROW_ORDER_STATUS.REFUNDED;
      action = "dispute_refund_issued";
    } else if (resolutionType === "release") {
      this.appendLedgerEntry({
        debitAccountId: buyerEscrowAccount.id,
        creditAccountId: sellerAvailableAccount.id,
        amount: fullAmount,
        currency: dispute.currency,
        idempotencyKey: `${idempotencyKey}:release`,
        entryType: "dispute_release",
        entityType: "dispute",
        entityId: dispute.id
      });
      dispute.status = DISPUTE_STATUS.RESOLVED_RELEASE_SELLER;
      dispute.resolution_type = "release_seller";
      dispute.resolution_amount = fullAmount;
      escrow.status = ESCROW_ORDER_STATUS.RELEASED;
      action = "dispute_escrow_released";
    } else if (resolutionType === "partial_refund") {
      const refundAmount = normalizeMoneyString(amount, "partial_refund.amount");
      if (moneyToBigInt(refundAmount) <= 0n || moneyToBigInt(refundAmount) >= moneyToBigInt(fullAmount)) {
        throw new Error("Partial refund amount must be greater than 0 and less than the full disputed amount");
      }
      const sellerAmount = subtractMoney(fullAmount, refundAmount);
      this.appendLedgerEntry({
        debitAccountId: buyerEscrowAccount.id,
        creditAccountId: buyerAvailableAccount.id,
        amount: refundAmount,
        currency: dispute.currency,
        idempotencyKey: `${idempotencyKey}:partial-refund`,
        entryType: "dispute_partial_refund",
        entityType: "dispute",
        entityId: dispute.id
      });
      this.appendLedgerEntry({
        debitAccountId: buyerEscrowAccount.id,
        creditAccountId: sellerAvailableAccount.id,
        amount: sellerAmount,
        currency: dispute.currency,
        idempotencyKey: `${idempotencyKey}:partial-release`,
        entryType: "dispute_partial_release",
        entityType: "dispute",
        entityId: dispute.id
      });
      dispute.status = DISPUTE_STATUS.RESOLVED_PARTIAL_REFUND;
      dispute.resolution_type = "partial_refund";
      dispute.resolution_amount = refundAmount;
      escrow.status = ESCROW_ORDER_STATUS.RELEASED;
      action = "dispute_partial_refund_issued";
    } else {
      throw new Error("Unsupported dispute resolution type");
    }

    dispute.resolved_at = this.now().toISOString();
    dispute.updated_at = dispute.resolved_at;
    escrow.updated_at = dispute.resolved_at;
    this.disputeResolutionIdempotency.set(idempotencyKey, dispute.id);
    this.addDisputeTimeline({ disputeId, actorUserId, actorRole, action, message: dispute.resolution_type, metadata: { amount: dispute.resolution_amount } });
    return { dispute: this.decorateDispute(dispute), reused: false };
  }

  createAdminReview({ id = this.id(), subjectType, subjectId, priority, status, notes }) {
    const review = { id, subject_type: subjectType, subject_id: subjectId, priority, status, notes, created_at: this.now().toISOString() };
    this.adminReviews.set(review.id, review);
    return clone(review);
  }

  listAdminReviews() {
    return [...this.adminReviews.values()].map(clone);
  }

  appendAuditEvent({ actorUserId = null, actorRole = null, action, entityType, entityId = null, ipAddress = null, metadata = {} }) {
    const event = {
      id: this.id(),
      actor_user_id: actorUserId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      metadata,
      created_at: this.now().toISOString()
    };
    this.auditEvents.set(event.id, event);
    return clone(event);
  }

  listAuditEvents() {
    return [...this.auditEvents.values()].map(clone);
  }

  assertMessageRateLimit(senderUserId) {
    const key = `${senderUserId}:${this.now().toISOString().slice(0, 16)}`;
    const count = this.messageRateLimit.get(key) || 0;
    if (count >= 30) {
      throw new Error("Message rate limit guard exceeded");
    }
    this.messageRateLimit.set(key, count + 1);
  }

  createMessage(input) {
    const senderUserId = input.senderUserId || input.sender_user_id;
    this.assertMessageRateLimit(senderUserId);
    const validated = validateMessageInput(input);
    const recipient = this.getUser(validated.recipient_user_id);
    if (!recipient) throw new Error("Recipient user not found");

    const threadId = input.threadId || input.thread_id || this.id();
    if (!this.messageThreads.has(threadId)) {
      this.messageThreads.set(threadId, {
        id: threadId,
        participant_user_ids: [senderUserId, recipient.id],
        subject: validated.subject,
        related_entity_type: validated.related_entity_type,
        related_entity_id: validated.related_entity_id,
        created_at: this.now().toISOString()
      });
    }

    const message = {
      id: this.id(),
      thread_id: threadId,
      sender_user_id: senderUserId,
      recipient_user_id: recipient.id,
      recipient_role: recipient.role,
      related_entity_type: validated.related_entity_type,
      related_entity_id: validated.related_entity_id,
      subject: validated.subject,
      body: validated.body,
      status: validated.status,
      created_at: this.now().toISOString(),
      read_at: null,
      archived_at: null
    };
    this.messages.set(message.id, message);
    return clone(message);
  }

  listMessagesForUser({ userId, role, status = null }) {
    return [...this.messages.values()]
      .filter((message) => role === ROLES.ADMIN || role === ROLES.SUPPORT || message.sender_user_id === userId || message.recipient_user_id === userId)
      .filter((message) => !status || message.status === status)
      .map(clone);
  }

  listThreadMessages({ threadId, userId, role }) {
    const items = [...this.messages.values()].filter((message) => message.thread_id === threadId);
    if (![ROLES.ADMIN, ROLES.SUPPORT].includes(role) && !items.some((message) => message.sender_user_id === userId || message.recipient_user_id === userId)) {
      throw new Error("Unauthorized message thread access");
    }
    return items.map(clone);
  }

  getMessage(messageId) {
    return clone(this.messages.get(messageId) || null);
  }

  markMessageRead(messageId) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error("Message not found");
    message.status = MESSAGE_STATUS.READ;
    message.read_at = this.now().toISOString();
    return clone(message);
  }

  archiveMessage(messageId) {
    const message = this.messages.get(messageId);
    if (!message) throw new Error("Message not found");
    message.status = MESSAGE_STATUS.ARCHIVED;
    message.archived_at = this.now().toISOString();
    return clone(message);
  }

  createAnnouncement({ senderUserId, subject, body, relatedEntityType = RELATED_ENTITY_TYPES.GENERAL, relatedEntityId = "" }) {
    return this.listUsers()
      .filter((user) => user.id !== senderUserId)
      .map((user) => this.createMessage({
        senderUserId,
        recipientUserId: user.id,
        subject,
        body,
        relatedEntityType,
        relatedEntityId
      }));
  }
}
