import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSign, generateKeyPairSync } from "node:crypto";
import { buildBinancePayCanonicalPayload, verifyBinancePayWebhook } from "../src/binancePay.js";

describe("Binance Pay webhook verification", () => {
  it("verifies an RSA-SHA256 signed canonical payload", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const body = "{\"bizType\":\"PAY\",\"status\":\"PAID\"}";
    const canonicalPayload = buildBinancePayCanonicalPayload({
      timestamp: "1770660000000",
      nonce: "nonce-123",
      body
    });

    const signer = createSign("RSA-SHA256");
    signer.update(canonicalPayload);
    signer.end();
    const signature = signer.sign(privateKey, "base64");

    const result = verifyBinancePayWebhook({
      timestamp: "1770660000000",
      nonce: "nonce-123",
      body,
      signature,
      publicKeyPem: publicKey.export({ type: "spki", format: "pem" })
    });

    assert.equal(result.ok, true);
  });

  it("rejects a tampered body", () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const canonicalPayload = buildBinancePayCanonicalPayload({
      timestamp: "1770660000000",
      nonce: "nonce-123",
      body: "{\"status\":\"PAID\"}"
    });

    const signer = createSign("RSA-SHA256");
    signer.update(canonicalPayload);
    signer.end();
    const signature = signer.sign(privateKey, "base64");

    const result = verifyBinancePayWebhook({
      timestamp: "1770660000000",
      nonce: "nonce-123",
      body: "{\"status\":\"FAILED\"}",
      signature,
      publicKeyPem: publicKey.export({ type: "spki", format: "pem" })
    });

    assert.equal(result.ok, false);
  });
});
