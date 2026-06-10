export class PaymentProvider {
  constructor({ name }) {
    this.name = name;
  }

  async createDepositRequest() {
    throw new Error("PaymentProvider.createDepositRequest must be implemented");
  }

  async verifyWebhook() {
    throw new Error("PaymentProvider.verifyWebhook must be implemented");
  }
}

export class MockSandboxProvider extends PaymentProvider {
  constructor() {
    super({ name: "mock_sandbox" });
  }

  async createDepositRequest({ deposit }) {
    return {
      provider: this.name,
      provider_reference: deposit.provider_reference,
      checkout_url: `sandbox://agentpay/deposits/${deposit.id}`,
      status: deposit.status
    };
  }

  async verifyWebhook({ webhookId }) {
    return { ok: true, webhook_id: webhookId, provider: this.name };
  }
}

export class BinancePayProvider extends PaymentProvider {
  constructor({ apiKey, secretKey, baseUrl, webhookSecret }) {
    super({ name: "binance_pay" });
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
    this.webhookSecret = webhookSecret;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.secretKey && this.baseUrl && this.webhookSecret);
  }

  async createDepositRequest({ deposit }) {
    if (!this.isConfigured()) {
      return {
        provider: this.name,
        provider_reference: deposit.provider_reference,
        status: deposit.status,
        checkout_url: null,
        configuration_required: true
      };
    }

    // TODO: Review final Binance Pay production request signing against the current official Binance Pay documentation before live credentials are used.
    return {
      provider: this.name,
      provider_reference: deposit.provider_reference,
      status: deposit.status,
      checkout_url: `${this.baseUrl.replace(/\/$/, "")}/checkout/${deposit.provider_reference}`,
      configuration_required: false
    };
  }

  async verifyWebhook() {
    // TODO: Verify production webhook signature against the current official Binance Pay documentation before live launch.
    return { ok: false, provider: this.name, reason: "Production Binance Pay webhook verification requires live credential configuration" };
  }
}

export function createPaymentProvider({ provider = "mock_sandbox", config }) {
  if (provider === "binance_pay") {
    return new BinancePayProvider({
      apiKey: config.binancePayApiKey,
      secretKey: config.binancePaySecretKey,
      baseUrl: config.binancePayBaseUrl,
      webhookSecret: config.binancePayWebhookSecret
    });
  }
  return new MockSandboxProvider();
}
