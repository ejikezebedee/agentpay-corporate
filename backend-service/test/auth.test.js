import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAdminToken, signAgentRequest, verifyAdminCredentials, verifyAdminToken, verifyAgentAuthorization } from "../src/auth.js";

describe("agent request authorization", () => {
  it("verifies HMAC-signed agent requests", () => {
    const signature = signAgentRequest({
      method: "POST",
      pathname: "/api/v1/orders",
      body: "{\"ok\":true}",
      secret: "test-secret"
    });

    const result = verifyAgentAuthorization({
      authorization: `Agent demo:${signature}`,
      method: "POST",
      pathname: "/api/v1/orders",
      body: "{\"ok\":true}",
      expectedKeyId: "demo",
      secret: "test-secret"
    });

    assert.equal(result.ok, true);
  });

  it("rejects tampered request bodies", () => {
    const signature = signAgentRequest({
      method: "POST",
      pathname: "/api/v1/orders",
      body: "{\"ok\":true}",
      secret: "test-secret"
    });

    const result = verifyAgentAuthorization({
      authorization: `Agent demo:${signature}`,
      method: "POST",
      pathname: "/api/v1/orders",
      body: "{\"ok\":false}",
      expectedKeyId: "demo",
      secret: "test-secret"
    });

    assert.equal(result.ok, false);
  });

  it("requires authorization when a secret is configured", () => {
    const result = verifyAgentAuthorization({
      authorization: "",
      method: "GET",
      pathname: "/api/v1/admin/audit-events",
      body: "",
      expectedKeyId: "demo",
      secret: "test-secret"
    });

    assert.equal(result.ok, false);
  });

  it("keeps explicit development mode unsecured when no secret is configured", () => {
    const result = verifyAgentAuthorization({
      authorization: "",
      method: "GET",
      pathname: "/api/v1/admin/audit-events",
      body: "",
      expectedKeyId: "demo",
      secret: ""
    });

    assert.equal(result.ok, true);
    assert.equal(result.mode, "development-unsecured");
  });
});

describe("admin backend authorization", () => {
  it("verifies configured admin credentials", () => {
    assert.equal(verifyAdminCredentials({
      email: "admin@zebepay.test",
      password: "admin-demo-pass",
      expectedEmail: "admin@zebepay.test",
      expectedPassword: "admin-demo-pass"
    }), true);
  });

  it("rejects invalid admin credentials", () => {
    assert.equal(verifyAdminCredentials({
      email: "admin@zebepay.test",
      password: "wrong",
      expectedEmail: "admin@zebepay.test",
      expectedPassword: "admin-demo-pass"
    }), false);
  });

  it("creates and verifies admin bearer tokens", () => {
    const token = createAdminToken({
      email: "admin@zebepay.test",
      secret: "admin-secret",
      now: 1000,
      ttlMs: 5000
    });

    const result = verifyAdminToken({
      authorization: `Bearer ${token}`,
      secret: "admin-secret",
      now: 2000
    });

    assert.equal(result.ok, true);
    assert.equal(result.email, "admin@zebepay.test");
  });

  it("rejects expired admin bearer tokens", () => {
    const token = createAdminToken({
      email: "admin@zebepay.test",
      secret: "admin-secret",
      now: 1000,
      ttlMs: 5000
    });

    const result = verifyAdminToken({
      authorization: `Bearer ${token}`,
      secret: "admin-secret",
      now: 7000
    });

    assert.equal(result.ok, false);
  });
});
