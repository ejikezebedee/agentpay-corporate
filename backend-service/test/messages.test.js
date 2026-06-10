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
const sellerToken = tokenFor("usr_seller", "seller", "seller@zebepay.test");

describe("internal messaging routes", () => {
  it("allows admins to send messages to users", async () => {
    await withServer(async (baseUrl) => {
      const sent = await jsonFetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUserId: "usr_buyer",
          subject: "Account notice",
          body: "Your account has an update.",
          relatedEntityType: "account"
        })
      });

      assert.equal(sent.response.status, 201);
      assert.equal(sent.payload.recipient_user_id, "usr_buyer");
      assert.equal(sent.payload.status, "sent");
    });
  });

  it("shows message history to the recipient", async () => {
    await withServer(async (baseUrl) => {
      const sent = await jsonFetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId: "usr_buyer", subject: "Order update", body: "Order changed." })
      });
      const history = await jsonFetch(`${baseUrl}/api/messages/${sent.payload.thread_id}`, {
        headers: { Authorization: `Bearer ${buyerToken}` }
      });

      assert.equal(history.response.status, 200);
      assert.ok(history.payload.items.some((item) => item.id === sent.payload.id));
    });
  });

  it("rejects unrelated users reading another user's message thread", async () => {
    await withServer(async (baseUrl) => {
      const sent = await jsonFetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId: "usr_buyer", subject: "Private notice", body: "Buyer only." })
      });
      const blocked = await jsonFetch(`${baseUrl}/api/messages/${sent.payload.thread_id}`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      assert.equal(blocked.response.status, 403);
    });
  });

  it("allows admins to send announcements", async () => {
    await withServer(async (baseUrl) => {
      const announcement = await jsonFetch(`${baseUrl}/api/messages/announcement`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "General announcement", body: "Platform update." })
      });

      assert.equal(announcement.response.status, 201);
      assert.ok(announcement.payload.items.length >= 3);
    });
  });

  it("rejects empty messages", async () => {
    await withServer(async (baseUrl) => {
      const rejected = await jsonFetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId: "usr_buyer", subject: "", body: "" })
      });

      assert.equal(rejected.response.status, 400);
    });
  });

  it("creates audit events for message actions", async () => {
    await withServer(async (baseUrl) => {
      const sent = await jsonFetch(`${baseUrl}/api/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientUserId: "usr_buyer", subject: "Audit notice", body: "Audit message." })
      });
      await jsonFetch(`${baseUrl}/api/messages/${sent.payload.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      await jsonFetch(`${baseUrl}/api/messages/${sent.payload.id}/archive`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${buyerToken}` }
      });
      await jsonFetch(`${baseUrl}/api/messages/announcement`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Audit announcement", body: "Announcement." })
      });
      const audit = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const actions = audit.payload.items.map((item) => item.action);

      assert.ok(actions.includes("message_sent"));
      assert.ok(actions.includes("message_read"));
      assert.ok(actions.includes("message_archived"));
      assert.ok(actions.includes("announcement_sent"));
    });
  });
});
