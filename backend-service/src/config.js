export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT || 3000),
    nodeEnv: env.NODE_ENV || "development",
    apiKeyId: env.AGENTPAY_API_KEY_ID || "demo-agent",
    apiKeySecret: env.AGENTPAY_API_KEY_SECRET || "",
    binancePayWebhookPublicKeyPem: normalizePem(env.BINANCE_PAY_WEBHOOK_PUBLIC_KEY_PEM || ""),
    databaseUrl: env.DATABASE_URL || "",
    mongoDbUrl: env.MONGODB_URL || "",
    mongoListingsCollection: env.MONGODB_LISTINGS_COLLECTION || "listings",
    auditLogLevel: env.AUDIT_LOG_LEVEL || "info"
  };
}

function normalizePem(value) {
  return value.replaceAll("\\n", "\n").trim();
}
