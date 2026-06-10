export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT || 3000),
    nodeEnv: env.NODE_ENV || "development",
    apiKeyId: env.AGENTPAY_API_KEY_ID || "demo-agent",
    apiKeySecret: env.AGENTPAY_API_KEY_SECRET || "",
    adminEmail: env.AGENTPAY_ADMIN_EMAIL || "admin@zebepay.test",
    adminPassword: env.AGENTPAY_ADMIN_PASSWORD || "admin-demo-pass",
    adminTokenSecret: env.AGENTPAY_ADMIN_TOKEN_SECRET || env.AGENTPAY_API_KEY_SECRET || "development-admin-token-secret",
    sessionTokenSecret: env.AGENTPAY_SESSION_TOKEN_SECRET || env.AGENTPAY_ADMIN_TOKEN_SECRET || env.AGENTPAY_API_KEY_SECRET || "development-session-token-secret",
    adminUsername: env.ADMIN_USERNAME || env.AGENTPAY_ADMIN_EMAIL || "admin@zebepay.test",
    adminPasswordHash: env.ADMIN_PASSWORD_HASH || "pbkdf2$310000$agentpay-dev-admin-salt$-Gw5LizLwD_I6s3O8QjvGgHe3ulC0JgDBcZ1wwWOWzA",
    adminSessionSecret: env.ADMIN_SESSION_SECRET || env.AGENTPAY_SESSION_TOKEN_SECRET || env.AGENTPAY_ADMIN_TOKEN_SECRET || "development-session-token-secret",
    appOrigin: env.AGENTPAY_APP_ORIGIN || "http://127.0.0.1:4173",
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
