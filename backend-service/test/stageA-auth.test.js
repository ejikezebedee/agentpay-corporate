import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAgentPayServer } from "../src/server.js";

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

describe("Stage A admin password lock", () => {
  it("rejects unauthenticated admin API access", async () => {
    await withServer(async (baseUrl) => {
      const result = await jsonFetch(`${baseUrl}/api/auth/session`);
      assert.equal(result.response.status, 401);
    });
  });

  it("rejects a wrong admin password", async () => {
    await withServer(async (baseUrl) => {
      const result = await jsonFetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin@zebepay.test", password: "wrong" })
      });
      assert.equal(result.response.status, 401);
    });
  });

  it("creates a session for the correct admin password and clears it on logout", async () => {
    await withServer(async (baseUrl) => {
      const login = await jsonFetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin@zebepay.test", password: "admin-demo-pass" })
      });
      assert.equal(login.response.status, 200);
      assert.ok(login.payload.token);

      const session = await jsonFetch(`${baseUrl}/api/auth/session`, {
        headers: { Authorization: `Bearer ${login.payload.token}` }
      });
      assert.equal(session.response.status, 200);
      assert.equal(session.payload.admin.email, "admin@zebepay.test");

      const logout = await jsonFetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${login.payload.token}` }
      });
      assert.equal(logout.response.status, 200);
      assert.match(logout.response.headers.get("set-cookie"), /Max-Age=0/);
    });
  });
});
