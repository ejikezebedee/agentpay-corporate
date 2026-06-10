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

const sellerToken = tokenFor("usr_seller", "seller", "seller@zebepay.test");
const adminToken = tokenFor("usr_admin", "admin", "admin@zebepay.test");

function listingPayload(overrides = {}) {
  return {
    title: `Seller Product ${Date.now()}`,
    description: "A listing created by the seller listing dashboard test.",
    category: "Development",
    productType: "digital",
    price: "100.00",
    discountType: "percentage",
    discountValue: "20",
    imageUrl: "",
    digitalFileUrl: "private://seller-product.zip",
    stockQuantity: 100,
    deliveryInstructions: "Deliver by private download after purchase authorization.",
    status: "draft",
    ...overrides
  };
}

describe("listing management routes", () => {
  it("allows sellers to create listings and show them in the dashboard list", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ title: "Created Listing Route Test" }))
      });
      const listed = await jsonFetch(`${baseUrl}/api/listings`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      assert.equal(created.response.status, 201);
      assert.equal(created.payload.title, "Created Listing Route Test");
      assert.equal(created.payload.final_price, "80.000000000000000000");
      assert.ok(listed.payload.items.some((item) => item.id === created.payload.id));
    });
  });

  it("allows a listing to be edited", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ title: "Editable Listing" }))
      });
      const updated = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Edited Listing", status: "pending_review" })
      });

      assert.equal(updated.response.status, 200);
      assert.equal(updated.payload.title, "Edited Listing");
      assert.equal(updated.payload.status, "pending_review");
    });
  });

  it("rejects invalid discounts", async () => {
    await withServer(async (baseUrl) => {
      const invalid = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ price: "50.00", discountType: "fixed", discountValue: "50.00" }))
      });

      assert.equal(invalid.response.status, 400);
      assert.match(invalid.payload.error, /final price greater than zero/);
    });
  });

  it("archives listings instead of hard deleting and hides them from active lists", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ title: "Archive Listing" }))
      });
      const archived = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      const listed = await jsonFetch(`${baseUrl}/api/listings`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      assert.equal(archived.response.status, 200);
      assert.equal(archived.payload.status, "archived");
      assert.equal(listed.payload.items.some((item) => item.id === created.payload.id), false);
    });
  });

  it("creates audit events for listing changes", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ title: "Audit Listing" }))
      });
      await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ discountType: "fixed", discountValue: "10.00", status: "paused" })
      });
      await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}/discount`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ discountType: "none", discountValue: "0" })
      });
      await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      const audit = await jsonFetch(`${baseUrl}/api/v1/admin/audit-events`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const actions = audit.payload.items.map((item) => item.action);

      assert.ok(actions.includes("listing_created"));
      assert.ok(actions.includes("listing_updated"));
      assert.ok(actions.includes("listing_discount_added"));
      assert.ok(actions.includes("listing_discount_removed"));
      assert.ok(actions.includes("listing_status_changed"));
      assert.ok(actions.includes("listing_archived"));
    });
  });

  it("supports explicit listing detail, status, and discount routes", async () => {
    await withServer(async (baseUrl) => {
      const created = await jsonFetch(`${baseUrl}/api/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload({ title: "Explicit Route Listing", discountType: "none", discountValue: "0" }))
      });
      const detail = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}`, {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      const status = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" })
      });
      const percentage = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}/discount`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ discountType: "percentage", discountValue: "25" })
      });
      const fixed = await jsonFetch(`${baseUrl}/api/listings/${created.payload.id}/discount`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${sellerToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ discountType: "fixed", discountValue: "10.00" })
      });

      assert.equal(detail.response.status, 200);
      assert.equal(status.payload.status, "paused");
      assert.equal(percentage.payload.final_price, "75.000000000000000000");
      assert.equal(fixed.payload.final_price, "90.000000000000000000");
    });
  });
});
