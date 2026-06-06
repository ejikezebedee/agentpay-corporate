import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertMoneyString, normalizeMoneyString } from "../src/money.js";

describe("money validation", () => {
  it("accepts decimal strings and normalizes to 18 decimal places", () => {
    assert.equal(normalizeMoneyString("48", "price"), "48.000000000000000000");
    assert.equal(normalizeMoneyString("32.50", "price"), "32.500000000000000000");
  });

  it("rejects JavaScript numbers", () => {
    assert.throws(() => assertMoneyString(48, "price"), /decimal string/);
  });

  it("rejects floats, scientific notation, negatives, and excess scale", () => {
    assert.throws(() => assertMoneyString("48.0000000000000000001", "price"), /NUMERIC/);
    assert.throws(() => assertMoneyString("1e3", "price"), /NUMERIC/);
    assert.throws(() => assertMoneyString("-1.00", "price"), /NUMERIC/);
  });
});
