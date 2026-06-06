import { createHmac, timingSafeEqual } from "node:crypto";

export function signAgentRequest({ method, pathname, body, secret }) {
  const payload = `${method.toUpperCase()}\n${pathname}\n${body || ""}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyAgentAuthorization({ authorization, method, pathname, body, expectedKeyId, secret }) {
  if (!secret) {
    return { ok: true, mode: "development-unsecured" };
  }

  const match = /^Agent\s+([^:]+):([a-f0-9]{64})$/i.exec(authorization || "");
  if (!match) {
    return { ok: false, reason: "Missing or malformed Agent authorization header" };
  }

  const [, keyId, signature] = match;
  if (keyId !== expectedKeyId) {
    return { ok: false, reason: "Unknown API key id" };
  }

  const expected = signAgentRequest({ method, pathname, body, secret });
  const providedBytes = Buffer.from(signature, "hex");
  const expectedBytes = Buffer.from(expected, "hex");

  if (providedBytes.length !== expectedBytes.length || !timingSafeEqual(providedBytes, expectedBytes)) {
    return { ok: false, reason: "Invalid request signature" };
  }

  return { ok: true, keyId };
}
