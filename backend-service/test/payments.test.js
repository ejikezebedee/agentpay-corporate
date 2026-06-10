import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BinancePayProvider, MockSandboxProvider, createPaymentProvider } from "../src/payments.js";

describe("payment provider architecture", () => {
  it("creates mock sandbox checkout sessions for local top-up testing", async () => {
    const provider = new MockSandboxProvider();
    const session = await provider.createDepositRequest({
      deposit: { id: "dep_1", provider_reference: "mock_ref", status: "pending" }
    });
    assert.equal(session.provider, "mock_sandbox");
    assert.equal(session.checkout_url, "sandbox://agentpay/deposits/dep_1");
  });

  it("keeps Binance Pay adapter credential-driven", async () => {
    const provider = createPaymentProvider({
      provider: "binance_pay",
      config: {
        binancePayApiKey: "",
        binancePaySecretKey: "",
        binancePayBaseUrl: "https://bpay.binanceapi.com",
        binancePayWebhookSecret: ""
      }
    });
    assert.ok(provider instanceof BinancePayProvider);
    const session = await provider.createDepositRequest({
      deposit: { id: "dep_2", provider_reference: "binance_ref", status: "pending" }
    });
    assert.equal(session.configuration_required, true);
    assert.equal(session.checkout_url, null);
  });
});
