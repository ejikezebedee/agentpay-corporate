import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { signAgentRequest, verifyAgentAuthorization } from "../src/auth.js";

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
