import { normalizeMoneyString } from "../money.js";
import { transitionOrder } from "../escrow.js";
import { insertAuditLog, insertLedgerEntry } from "./sql/ledger.js";
import { selectActiveListingBySlug } from "./sql/listings.js";
import { insertOrder, selectOrderById, selectOrderByIdempotency, updateOrderStatus } from "./sql/orders.js";
import { lockEscrowBalances, refundEscrowBalances, releaseEscrowBalances, selectWalletForUpdate } from "./sql/wallets.js";

export class PostgresSettlementRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async createOrder({ publicSlug, buyerUserId, buyerAgentId, idempotencyKey, requestPayload }) {
    return this.withTransaction(async (client) => {
      const existing = await client.query(selectOrderByIdempotency, [buyerUserId, idempotencyKey]);
      if (existing.rows[0]) {
        return { order: existing.rows[0], reused: true };
      }

      const listingResult = await client.query(selectActiveListingBySlug, [publicSlug]);
      const listing = listingResult.rows[0];
      if (!listing) {
        throw new Error("Active listing not found");
      }

      const amount = normalizeMoneyString(listing.price, "listing.price");
      const orderResult = await client.query(insertOrder, [
        listing.id,
        buyerUserId,
        buyerAgentId || null,
        listing.merchant_profile_id,
        amount,
        listing.currency,
        idempotencyKey,
        JSON.stringify(requestPayload || {})
      ]);

      await client.query(insertAuditLog, [
        "agent",
        buyerAgentId || null,
        "order.created",
        "order",
        orderResult.rows[0].id,
        null,
        JSON.stringify({ public_slug: publicSlug, amount, currency: listing.currency })
      ]);

      return { order: orderResult.rows[0], reused: false };
    });
  }

  async applyOrderAction({ orderId, action }) {
    return this.withTransaction(async (client) => {
      const orderResult = await client.query(selectOrderById, [orderId]);
      const order = orderResult.rows[0];
      if (!order) {
        throw new Error("Order not found");
      }

      const next = transitionOrder(order, action);
      if (next.ledgerEffects?.includes("escrow_lock")) {
        await this.lockEscrow(client, next);
      }

      if (next.ledgerEffects?.includes("escrow_release")) {
        await this.releaseEscrow(client, next);
      }

      if (next.ledgerEffects?.includes("refund")) {
        await this.refundEscrow(client, next);
      }

      const updated = await client.query(updateOrderStatus, [orderId, next.status]);
      await client.query(insertAuditLog, [
        "system",
        null,
        `order.${action}`,
        "order",
        orderId,
        null,
        JSON.stringify({ status: next.status, ledger_effects: next.ledgerEffects || [] })
      ]);

      return updated.rows[0];
    });
  }

  async lockEscrow(client, order) {
    const wallet = await this.requireBuyerWallet(client, order);
    const updatedWallet = await client.query(lockEscrowBalances, [order.buyer_user_id, order.currency, order.amount]);
    if (!updatedWallet.rows[0]) {
      throw new Error("Insufficient available wallet balance");
    }

    await client.query(insertLedgerEntry, [wallet.id, order.id, "escrow_lock", order.amount, "0", order.currency, `order:${order.id}:escrow_lock`]);
  }

  async releaseEscrow(client, order) {
    const wallet = await this.requireBuyerWallet(client, order);
    const updatedWallet = await client.query(releaseEscrowBalances, [order.buyer_user_id, order.currency, order.amount]);
    if (!updatedWallet.rows[0]) {
      throw new Error("Insufficient escrow balance");
    }

    await client.query(insertLedgerEntry, [wallet.id, order.id, "escrow_release", order.amount, "0", order.currency, `order:${order.id}:escrow_release`]);
  }

  async refundEscrow(client, order) {
    const wallet = await this.requireBuyerWallet(client, order);
    const updatedWallet = await client.query(refundEscrowBalances, [order.buyer_user_id, order.currency, order.amount]);
    if (!updatedWallet.rows[0]) {
      throw new Error("Insufficient escrow balance");
    }

    await client.query(insertLedgerEntry, [wallet.id, order.id, "refund", "0", order.amount, order.currency, `order:${order.id}:refund`]);
  }

  async requireBuyerWallet(client, order) {
    const wallet = await client.query(selectWalletForUpdate, [order.buyer_user_id, order.currency]);
    if (!wallet.rows[0]) {
      throw new Error("Buyer wallet not found");
    }

    return wallet.rows[0];
  }

  async withTransaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await callback(client);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}
