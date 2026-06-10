import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createUserSessionToken } from "../src/auth.js";
import { createAgentPayServer } from "../src/server.js";

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

const adminToken = tokenFor("usr_admin", "admin", "admin@zebepay.test");
const buyerToken = tokenFor("usr_buyer", "buyer", "buyer@zebepay.test");
const unrelatedBuyerToken = tokenFor("usr_admin", "buyer", "admin@zebepay.test");

async function firstDispute(baseUrl) {
  const listed = await jsonFetch(`${baseUrl}/api/disputes`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(listed.response.status, 200);
  return listed.payload.items[0];
}

async function wallet(baseUrl, token) {
  const result = await jsonFetch(`${baseUrl}/api/v1/wallet/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(result.response.status, 200);
  return result.payload.accounts;
}

describe("Stage B dispute management", () => {
  it("allows admins to list and open dispute detail", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const detail = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(detail.response.status, 200);
      assert.equal(detail.payload.id, dispute.id);
      assert.ok(detail.payload.timeline.length >= 1);
    });
  });

  it("changes status, requests evidence, sends message, and adds note", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const status = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "under_review" })
      });
      const requestEvidence = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/request-evidence`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requiredFrom: "buyer" })
      });
      const message = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/message`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientRole: "buyer", subject: "Evidence needed", body: "Please provide more evidence." })
      });
      const note = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/admin-note`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Review download logs before resolution." })
      });

      assert.equal(status.payload.status, "under_review");
      assert.equal(requestEvidence.payload.status, "awaiting_buyer_response");
      assert.equal(message.response.status, 201);
      assert.equal(message.payload.related_entity_type, "dispute");
      assert.equal(note.payload.admin_note, "Review download logs before resolution.");
    });
  });

  it("rejects unrelated user dispute access", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const rejected = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}`, {
        headers: { Authorization: `Bearer ${unrelatedBuyerToken}` }
      });
      assert.equal(rejected.response.status, 403);
    });
  });

  it("refunds buyer through escrow ledger and rejects duplicate resolution", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const refunded = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/refund`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Idempotency-Key": "refund-demo-dispute" }
      });
      const duplicate = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/refund`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Idempotency-Key": "refund-demo-dispute" }
      });
      const buyerWallet = await wallet(baseUrl, buyerToken);

      assert.equal(refunded.payload.status, "resolved_refund_buyer");
      assert.equal(duplicate.payload.status, "resolved_refund_buyer");
      assert.equal(buyerWallet.available, "48.000000000000000000");
      assert.equal(buyerWallet.escrow_locked, "0.000000000000000000");
    });
  });

  it("releases escrow to seller through ledger", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const released = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/release`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Idempotency-Key": "release-demo-dispute" }
      });
      const sellerWallet = await wallet(baseUrl, tokenFor("usr_seller", "seller", "seller@zebepay.test"));

      assert.equal(released.payload.status, "resolved_release_seller");
      assert.equal(sellerWallet.available, "48.000000000000000000");
    });
  });

  it("partial refund splits escrow funds", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      const split = await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/partial-refund`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json", "Idempotency-Key": "split-demo-dispute" },
        body: JSON.stringify({ amount: "12.00" })
      });
      const buyerWallet = await wallet(baseUrl, buyerToken);
      const sellerWallet = await wallet(baseUrl, tokenFor("usr_seller", "seller", "seller@zebepay.test"));

      assert.equal(split.payload.status, "resolved_partial_refund");
      assert.equal(buyerWallet.available, "12.000000000000000000");
      assert.equal(buyerWallet.escrow_locked, "0.000000000000000000");
      assert.equal(sellerWallet.available, "36.000000000000000000");
    });
  });

  it("creates audit events for dispute actions", async () => {
    await withServer(async (baseUrl) => {
      const dispute = await firstDispute(baseUrl);
      await jsonFetch(`${baseUrl}/api/disputes/${dispute.id}/escalate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Escalate for audit test" })
      });
      const audit = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const actions = audit.payload.items.map((item) => item.action);
      assert.ok(actions.includes("dispute_viewed"));
      assert.ok(actions.includes("dispute_escalated"));
    });
  });
});
