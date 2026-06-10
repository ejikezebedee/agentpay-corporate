import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createUserSessionToken } from "../src/auth.js";
import { createAgentPayServer } from "../src/server.js";

const sessionSecret = "development-session-token-secret";
const adminToken = createUserSessionToken({ userId: "usr_admin", role: "admin", email: "admin@zebepay.test", secret: sessionSecret });

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

describe("public website backend routes", () => {
  it("shows only active listings in the public marketplace API", async () => {
    await withServer(async (baseUrl) => {
      const publicBefore = await jsonFetch(`${baseUrl}/api/public/listings`);
      assert.equal(publicBefore.response.status, 200);
      assert.ok(publicBefore.payload.items.every((item) => item.status === "active"));
      assert.equal(publicBefore.payload.items.some((item) => item.id === "lst_demo_physical"), false);

      await jsonFetch(`${baseUrl}/api/listings/lst_demo_digital`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const publicAfter = await jsonFetch(`${baseUrl}/api/public/listings`);
      assert.equal(publicAfter.payload.items.some((item) => item.id === "lst_demo_digital"), false);
    });
  });

  it("stores contact requests as audit events", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/contact-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Operator", email: "operator@example.com", message: "Launch request" })
      });
      const audit = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(created.response.status, 201);
      assert.ok(audit.payload.items.some((item) => item.action === "contact_request_received"));
    });
  });
});
