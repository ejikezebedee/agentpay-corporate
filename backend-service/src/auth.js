import { createHmac, pbkdf2Sync, timingSafeEqual } from "node:crypto";

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

function safeEqualText(left, right) {
  const leftBytes = Buffer.from(String(left));
  const rightBytes = Buffer.from(String(right));

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}

export function verifyAdminCredentials({ email, password, expectedEmail, expectedPassword }) {
  return safeEqualText(email || "", expectedEmail || "") && safeEqualText(password || "", expectedPassword || "");
}

export function verifyPasswordHash({ password, passwordHash }) {
  const [scheme, iterationsText, salt, expectedHash] = String(passwordHash || "").split("$");
  if (scheme !== "pbkdf2" || !iterationsText || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000) {
    return false;
  }

  const actualHash = pbkdf2Sync(String(password || ""), salt, iterations, 32, "sha256").toString("base64url");
  return safeEqualText(actualHash, expectedHash);
}

export function createAdminToken({ email, secret, now = Date.now(), ttlMs = 8 * 60 * 60 * 1000 }) {
  const expiresAt = now + ttlMs;
  const subject = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const signature = createHmac("sha256", secret).update(subject).digest("base64url");
  return `${subject}.${signature}`;
}

export function verifyAdminToken({ authorization, secret, now = Date.now() }) {
  const match = /^Bearer\s+([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(authorization || "");
  if (!match) {
    return { ok: false, reason: "Missing or malformed admin bearer token" };
  }

  const [, subject, signature] = match;
  const expectedSignature = createHmac("sha256", secret).update(subject).digest("base64url");

  if (!safeEqualText(signature, expectedSignature)) {
    return { ok: false, reason: "Invalid admin token" };
  }

  const payload = JSON.parse(Buffer.from(subject, "base64url").toString("utf8"));
  if (!payload.email || !payload.expiresAt || payload.expiresAt <= now) {
    return { ok: false, reason: "Admin token expired" };
  }

  return { ok: true, email: payload.email, expiresAt: payload.expiresAt };
}

export function createUserSessionToken({ userId, role, email, secret, now = Date.now(), ttlMs = 8 * 60 * 60 * 1000 }) {
  const expiresAt = now + ttlMs;
  const subject = Buffer.from(JSON.stringify({ userId, role, email, expiresAt })).toString("base64url");
  const signature = createHmac("sha256", secret).update(subject).digest("base64url");
  return `${subject}.${signature}`;
}

export function verifyUserSessionToken({ authorization, secret, now = Date.now() }) {
  const tokenSource = String(authorization || "").startsWith("Bearer ") ? authorization : `Bearer ${authorization || ""}`;
  const match = /^Bearer\s+([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(tokenSource);
  if (!match) {
    return { ok: false, reason: "Missing or malformed bearer token" };
  }

  const [, subject, signature] = match;
  const expectedSignature = createHmac("sha256", secret).update(subject).digest("base64url");
  if (!safeEqualText(signature, expectedSignature)) {
    return { ok: false, reason: "Invalid bearer token" };
  }

  const payload = JSON.parse(Buffer.from(subject, "base64url").toString("utf8"));
  if (!payload.userId || !payload.role || !payload.expiresAt || payload.expiresAt <= now) {
    return { ok: false, reason: "Bearer token expired" };
  }

  return { ok: true, userId: payload.userId, role: payload.role, email: payload.email, expiresAt: payload.expiresAt };
}

export function requireRole(session, allowedRoles) {
  if (!session?.ok) {
    return { ok: false, statusCode: 401, reason: session?.reason || "Authentication required" };
  }

  if (!allowedRoles.includes(session.role)) {
    return { ok: false, statusCode: 403, reason: "Insufficient role permissions" };
  }

  return { ok: true, session };
}
