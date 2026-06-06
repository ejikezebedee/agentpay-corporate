import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadListingRequirementSchema, loadVisibleCatalog } from "../src/catalog.js";
import { createOrder } from "../src/store.js";
import { ORDER_STATUS, transitionOrder } from "../src/escrow.js";
import { buildSandboxClientEnvironment } from "../src/sandbox.js";

describe("AgentPay flagship listing", () => {
  it("exposes the deployment package listing with API schema discovery", async () => {
    const catalog = await loadVisibleCatalog();
    const listing = catalog.find((item) => item.public_slug === "agentpay-corporate");

    assert.ok(listing);
    assert.equal(listing.title, "AgentPay Enterprise Node Deployment Package");
    assert.equal(listing.price, "5000.000000000000000000");
    assert.equal(listing.currency, "USDT");
    assert.equal(listing.requirements_schema_url, "/api/v1/listings/agentpay-corporate/schema");
    assert.equal(listing.delivery_artifact.filename, "agentpay-corporate.zip");
  });

  it("loads buyer-agent registration and deployment intake schema", async () => {
    const schema = await loadListingRequirementSchema("listing-schemas/agentpay-corporate-deployment.v1.json");

    assert.equal(schema.title, "AgentPay Enterprise Node Deployment Package");
    assert.ok(schema.required.includes("company_registration"));
    assert.ok(schema.required.includes("buyer_agent"));
    assert.ok(schema.properties.buyer_agent.required.includes("ed25519_public_key"));
    assert.ok(schema.properties.target_deployment.required.includes("api_subdomain"));
  });

  it("marks verified archive delivery ready after escrow locks", async () => {
    const [listing] = (await loadVisibleCatalog()).filter((item) => item.public_slug === "agentpay-corporate");
    const { order } = createOrder({
      listing,
      buyerUserId: "buyer-1",
      buyerAgentId: "agent-1",
      idempotencyKey: "agentpay-corporate-order-001",
      requestPayload: {}
    });

    const approved = transitionOrder(order, "approve");
    const locked = transitionOrder(approved, "lock_escrow");

    assert.equal(locked.status, ORDER_STATUS.ESCROW_LOCKED);
    assert.equal(locked.delivery_artifact.filename, "agentpay-corporate.zip");
  });

  it("builds a sandbox client environment for test wallet and buyer-agent flow", async () => {
    const catalog = await loadVisibleCatalog();
    const sandbox = buildSandboxClientEnvironment({ catalog });

    assert.equal(sandbox.mode, "sandbox");
    assert.equal(sandbox.wallet.asset, "testUSDT");
    assert.equal(sandbox.flagship_listing.public_slug, "agentpay-corporate");
    assert.equal(sandbox.flagship_listing.price, "5000.000000000000000000");
    assert.equal(sandbox.flagship_listing.schema_url, "/api/v1/listings/agentpay-corporate/schema");
    assert.ok(sandbox.buyer_agent_flow.includes("POST /api/v1/orders/{orderId}/lock_escrow"));
    assert.match(sandbox.launch_gate, /Live USDT/);
  });
});
