import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createUserSessionToken } from "../src/auth.js";
import { MemoryAgentPayRepository } from "../src/domain/memoryRepository.js";
import { WALLET_ACCOUNT_TYPES } from "../src/domain/models.js";
import { appRepository, createAgentPayServer } from "../src/server.js";

const sessionSecret = "development-session-token-secret";

function tokenFor(userId, role, email) {
  return createUserSessionToken({ userId, role, email, secret: sessionSecret });
}

async function withServer(callback) {
  const server = createAgentPayServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    return await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();
  return { response, payload };
}

describe("Stage 1 protected routes", () => {
  it("rejects non-admin users from admin routes", async () => {
    await withServer(async (baseUrl) => {
      const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
      const { response, payload } = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });

      assert.equal(response.status, 403);
      assert.match(payload.error, /Insufficient role/);
    });
  });

  it("allows buyers to view wallet summaries", async () => {
    await withServer(async (baseUrl) => {
      const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
      const { response, payload } = await jsonFetch(`${baseUrl}/api/v1/wallet/summary`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });

      assert.equal(response.status, 200);
      assert.equal(payload.wallet.user_id, "usr_buyer");
      assert.equal(payload.accounts.available, "0.000000000000000000");
    });
  });

  it("creates sandbox deposits as pending", async () => {
    await withServer(async (baseUrl) => {
      const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
      const { response, payload } = await jsonFetch(`${baseUrl}/api/v1/sandbox/deposits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "deposit-stage1-pending"
        },
        body: JSON.stringify({ amount: "25.00", currency: "USDT" })
      });

      assert.equal(response.status, 201);
      assert.equal(payload.status, "pending");
      assert.equal(payload.amount, "25.000000000000000000");
    });
  });

  it("confirms sandbox deposits once and ignores duplicate webhook confirmations", async () => {
    await withServer(async (baseUrl) => {
      const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
      const adminToken = tokenFor("usr_admin", "admin", "admin@zebepay.test");
      const created = await jsonFetch(`${baseUrl}/api/v1/sandbox/deposits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "deposit-stage1-confirm"
        },
        body: JSON.stringify({ amount: "31.00", currency: "USDT" })
      });

      const confirmOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "webhook-stage1-confirm"
        },
        body: JSON.stringify({ deposit_id: created.payload.id })
      };

      const first = await jsonFetch(`${baseUrl}/api/v1/sandbox/deposits/confirm`, confirmOptions);
      const second = await jsonFetch(`${baseUrl}/api/v1/sandbox/deposits/confirm`, confirmOptions);
      const wallet = await jsonFetch(`${baseUrl}/api/v1/wallet/summary`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      const ledger = await jsonFetch(`${baseUrl}/api/v1/wallet/ledger`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });

      assert.equal(first.response.status, 200);
      assert.equal(second.response.status, 200);
      assert.equal(first.payload.status, "confirmed");
      assert.equal(second.payload.status, "confirmed");
      assert.equal(wallet.payload.accounts.available, "31.000000000000000000");
      assert.equal(ledger.payload.items.filter((item) => item.entity_id === created.payload.id).length, 1);
    });
  });

  it("creates audit events for protected route access and deposit actions", async () => {
    await withServer(async (baseUrl) => {
      const adminToken = tokenFor("usr_admin", "admin", "admin@zebepay.test");
      const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
      await jsonFetch(`${baseUrl}/api/v1/admin/review-queue`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      const { response, payload } = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      assert.equal(response.status, 200);
      assert.ok(payload.items.some((item) => item.action === "admin.route_accessed"));
      assert.ok(appRepository.listAuditEvents().some((item) => item.action === "unauthorized_access_rejected"));
    });
  });
});

describe("Stage 1 wallet ledger primitives", () => {
  it("keeps ledger entries immutable through repository reads", () => {
    const repository = new MemoryAgentPayRepository();
    const account = repository.getWalletAccount("usr_buyer", "USDT", WALLET_ACCOUNT_TYPES.AVAILABLE);
    const result = repository.appendLedgerEntry({
      creditAccountId: account.id,
      amount: "10.00",
      currency: "USDT",
      idempotencyKey: "immutable-entry",
      entryType: "deposit_credit",
      entityType: "deposit",
      entityId: "dep_immutable"
    });

    result.entry.amount = "999.000000000000000000";
    const stored = repository.listLedgerEntries("usr_buyer", "USDT").find((entry) => entry.id === result.entry.id);
    assert.equal(stored.amount, "10.000000000000000000");
  });

  it("rejects negative balance movements", () => {
    const repository = new MemoryAgentPayRepository();
    const account = repository.getWalletAccount("usr_buyer", "USDT", WALLET_ACCOUNT_TYPES.AVAILABLE);

    assert.throws(() => repository.appendLedgerEntry({
      debitAccountId: account.id,
      amount: "1.00",
      currency: "USDT",
      idempotencyKey: "negative-move",
      entryType: "escrow_lock",
      entityType: "escrow_order",
      entityId: "esc_negative"
    }), /Insufficient funds/);
  });
});
