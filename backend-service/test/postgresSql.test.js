import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { insertOrder, updateOrderStatus } from "../src/repositories/sql/orders.js";
import { lockEscrowBalances, refundEscrowBalances, releaseEscrowBalances } from "../src/repositories/sql/wallets.js";
import { insertLedgerEntry } from "../src/repositories/sql/ledger.js";

describe("PostgreSQL settlement SQL", () => {
  it("casts inserted order amounts through money_amount", () => {
    assert.match(insertOrder, /\$5::money_amount/);
  });

  it("uses transaction-safe wallet balance checks", () => {
    assert.match(lockEscrowBalances, /available_balance >= \$3::money_amount/);
    assert.match(releaseEscrowBalances, /escrow_balance >= \$3::money_amount/);
    assert.match(refundEscrowBalances, /escrow_balance >= \$3::money_amount/);
  });

  it("stores ledger amounts through money_amount", () => {
    assert.match(insertLedgerEntry, /\$4::money_amount/);
    assert.match(insertLedgerEntry, /\$5::money_amount/);
  });

  it("updates delivery and release timestamps only on matching states", () => {
    assert.match(updateOrderStatus, /delivered_at = case when \$2 = 'delivered'/);
    assert.match(updateOrderStatus, /released_at = case when \$2 = 'released'/);
  });
});
