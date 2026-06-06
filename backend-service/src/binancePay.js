import { createVerify } from "node:crypto";

export function buildBinancePayCanonicalPayload({ timestamp, nonce, body }) {
  return `${timestamp}\n${nonce}\n${body}\n`;
}

export function verifyBinancePayWebhook({ timestamp, nonce, body, signature, publicKeyPem }) {
  if (!publicKeyPem) {
    return { ok: false, reason: "Webhook public key is not configured" };
  }

  if (!timestamp || !nonce || !signature) {
    return { ok: false, reason: "Missing Binance Pay webhook signature headers" };
  }

  const canonicalPayload = buildBinancePayCanonicalPayload({ timestamp, nonce, body });
  const verifier = createVerify("RSA-SHA256");
  verifier.update(canonicalPayload);
  verifier.end();

  const ok = verifier.verify(publicKeyPem, signature, "base64");
  return ok ? { ok: true } : { ok: false, reason: "Invalid Binance Pay webhook signature" };
}
