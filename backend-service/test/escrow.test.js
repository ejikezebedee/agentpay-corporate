import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ORDER_STATUS, transitionOrder } from "../src/escrow.js";

describe("escrow transitions", () => {
  it("allows the normal release path", () => {
    const created = { id: "order-1", status: ORDER_STATUS.CREATED };
    const approved = transitionOrder(created, "approve");
    const locked = transitionOrder(approved, "lock_escrow");
    const delivered = transitionOrder(locked, "deliver");
    const released = transitionOrder(delivered, "release");

    assert.equal(released.status, ORDER_STATUS.RELEASED);
    assert.deepEqual(released.ledgerEffects, ["escrow_release"]);
  });

  it("blocks release before delivery", () => {
    assert.throws(
      () => transitionOrder({ id: "order-2", status: ORDER_STATUS.ESCROW_LOCKED }, "release"),
      /Cannot release/
    );
  });
});
