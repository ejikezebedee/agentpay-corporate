export function buildSandboxClientEnvironment({ catalog }) {
  const flagshipListing = catalog.find((item) => item.public_slug === "agentpay-corporate");

  if (!flagshipListing) {
    throw new Error("AgentPay flagship listing is required for sandbox client environment");
  }

  return {
    mode: "sandbox",
    network: "testnet",
    wallet: {
      asset: "testUSDT",
      available_balance: "1000.000000000000000000",
      escrow_locked: "0.000000000000000000",
      funding_action: "fund_test_wallet",
      production_boundary: "Sandbox funding uses demo testnet credits only. No live assets move."
    },
    flagship_listing: {
      id: flagshipListing.id,
      public_slug: flagshipListing.public_slug,
      title: flagshipListing.title,
      price: flagshipListing.price,
      currency: flagshipListing.currency,
      schema_url: flagshipListing.requirements_schema_url,
      delivery_artifact: flagshipListing.delivery_artifact
    },
    buyer_agent_flow: [
      "GET /api/v1/listings/agentpay-corporate/schema",
      "POST /api/v1/orders with Idempotency-Key and signed buyer-agent payload",
      "POST /api/v1/orders/{orderId}/approve",
      "POST /api/v1/orders/{orderId}/lock_escrow",
      "Read delivery_proof.status=archive_delivery_ready"
    ],
    escrow_trigger: "archive_delivery_ready after escrow_locked",
    launch_gate: "Live USDT, custody, production escrow, and automated archive transport remain disabled until deployment approval."
  };
}
