import { describe, expect, it } from "vitest";
import { createChain, indexedEvents, mineBlock, submitTx } from "./chain";
import { createTopic, lag, murmur2, partitionFor, poll, produce, rangeAssign } from "./kafka";
import {
  balanceOf,
  createLedger,
  postEntry,
  reverse,
  transfer,
  trialBalance,
  type LedgerState,
} from "./ledger";
import { apply, createPayment, scenarios, type Payment } from "./payment";

function seededLedger(): LedgerState {
  let state = createLedger([
    { id: "cash", name: "Settlement", type: "asset", allowNegative: true },
    { id: "a", name: "A", type: "liability" },
    { id: "b", name: "B", type: "liability" },
    { id: "fees", name: "Fees", type: "revenue" },
  ]);
  const funded = postEntry(state, {
    description: "Deposit",
    idempotencyKey: "seed",
    lines: [
      { accountId: "cash", side: "debit", amount: 50_000_00 },
      { accountId: "a", side: "credit", amount: 50_000_00 },
    ],
  });
  if (!funded.ok) throw new Error(funded.error);
  state = funded.state;
  return state;
}

describe("ledger", () => {
  it("posts a balanced transfer and updates both balances", () => {
    const result = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 10_000_00,
      idempotencyKey: "k1",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(balanceOf(result.state, "a")).toBe(40_000_00);
    expect(balanceOf(result.state, "b")).toBe(10_000_00);
    expect(trialBalance(result.state).balanced).toBe(true);
  });

  it("rejects unbalanced entries", () => {
    const result = postEntry(seededLedger(), {
      description: "bad",
      idempotencyKey: "k",
      lines: [
        { accountId: "a", side: "debit", amount: 100 },
        { accountId: "b", side: "credit", amount: 99 },
      ],
    });
    expect(result).toEqual({ ok: false, error: "UNBALANCED" });
  });

  it("rejects non-integer and non-positive amounts", () => {
    const result = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 10.5,
      idempotencyKey: "k",
    });
    expect(result).toEqual({ ok: false, error: "INVALID_AMOUNT" });
  });

  it("refuses to overdraw a customer account", () => {
    const result = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 60_000_00,
      idempotencyKey: "k",
    });
    expect(result).toEqual({ ok: false, error: "INSUFFICIENT_FUNDS" });
  });

  it("replays a retried request without posting twice", () => {
    const first = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 1_000_00,
      idempotencyKey: "retry",
    });
    if (!first.ok) throw new Error();
    const second = transfer(first.state, {
      from: "a",
      to: "b",
      amount: 1_000_00,
      idempotencyKey: "retry",
    });
    expect(second.ok && second.replayed).toBe(true);
    if (!second.ok) return;
    expect(second.state.entries).toHaveLength(first.state.entries.length);
    expect(balanceOf(second.state, "a")).toBe(49_000_00);
  });

  it("rejects an idempotency key reused with a different body", () => {
    const first = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 1_000_00,
      idempotencyKey: "k",
    });
    if (!first.ok) throw new Error();
    const second = transfer(first.state, {
      from: "a",
      to: "b",
      amount: 2_000_00,
      idempotencyKey: "k",
    });
    expect(second).toEqual({ ok: false, error: "IDEMPOTENCY_KEY_REUSED" });
  });

  it("charges a fee as a third line and still balances", () => {
    const result = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 10_000_00,
      fee: 50_00,
      feeAccount: "fees",
      idempotencyKey: "fee",
    });
    if (!result.ok) throw new Error(result.error);
    expect(result.entry.lines).toHaveLength(3);
    expect(balanceOf(result.state, "a")).toBe(39_950_00);
    expect(balanceOf(result.state, "fees")).toBe(50_00);
    expect(trialBalance(result.state).balanced).toBe(true);
  });

  it("reverses with a compensating entry and never edits history", () => {
    const posted = transfer(seededLedger(), {
      from: "a",
      to: "b",
      amount: 5_000_00,
      idempotencyKey: "t",
    });
    if (!posted.ok) throw new Error();
    const reversed = reverse(posted.state, posted.entry.id, "rev");
    if (!reversed.ok) throw new Error(reversed.error);
    expect(reversed.state.entries).toHaveLength(posted.state.entries.length + 1);
    expect(balanceOf(reversed.state, "a")).toBe(50_000_00);
    expect(balanceOf(reversed.state, "b")).toBe(0);
    expect(reverse(reversed.state, posted.entry.id, "rev-2")).toEqual({
      ok: false,
      error: "ALREADY_REVERSED",
    });
  });
});

describe("payment state machine", () => {
  function run(events: Parameters<typeof apply>[1][]): Payment {
    return events.reduce((p, e) => apply(p, e).payment, createPayment("pay_1"));
  }

  it("treats a timeout as UNKNOWN, not FAILED", () => {
    const p = run([{ type: "SUBMIT" }, { type: "PROVIDER_TIMEOUT" }]);
    expect(p.state).toBe("UNKNOWN");
  });

  it("ignores duplicate webhooks", () => {
    let p = run([{ type: "SUBMIT" }, { type: "PROVIDER_ACCEPTED" }]);
    const hook = { type: "WEBHOOK", result: "SUCCEEDED", providerRef: "r1" } as const;
    p = apply(p, hook).payment;
    const again = apply(p, hook);
    expect(again.outcome.kind).toBe("duplicate");
    expect(again.payment.history).toHaveLength(p.history.length);
  });

  it("rejects illegal transitions", () => {
    const { outcome } = apply(createPayment("x"), { type: "SETTLE" });
    expect(outcome.kind).toBe("rejected");
  });

  it("only fails over before acceptance", () => {
    const pending = run([{ type: "SUBMIT" }, { type: "PROVIDER_ACCEPTED" }]);
    expect(apply(pending, { type: "PROVIDER_UNAVAILABLE" }).outcome.kind).toBe("rejected");
  });

  it("every built-in scenario ends in a sensible state", () => {
    const finals = Object.fromEntries(scenarios.map((s) => [s.id, run(s.events)]));
    expect(finals.happy!.state).toBe("RECONCILED");
    expect(finals.timeout!.state).toBe("RECONCILED");
    expect(finals.duplicate!.state).toBe("RECONCILED");
    expect(finals.failover!.state).toBe("RECONCILED");
    expect(finals.failover!.provider).toBe("fallback");
    expect(finals.break!.state).toBe("SETTLED");
  });
});

describe("kafka model", () => {
  it("matches Kafka's murmur2 test vectors", () => {
    const enc = new TextEncoder();
    expect(murmur2(enc.encode("21"))).toBe(-973932308);
    expect(murmur2(enc.encode("foobar"))).toBe(-790332482);
    expect(murmur2(enc.encode("a-little-bit-long-string"))).toBe(-985981536);
    expect(murmur2(enc.encode("a-little-bit-longer-string"))).toBe(-1486304829);
    expect(murmur2(enc.encode("lkjh234lh9fiuh90y23oiuhsafujhadof229phr9h19h89h8"))).toBe(-58897971);
    expect(murmur2(new Uint8Array([97, 98, 99]))).toBe(479470107);
  });

  it("maps a key to the same partition every time", () => {
    const p = partitionFor("acct-42", 6);
    for (let i = 0; i < 10; i++) expect(partitionFor("acct-42", 6)).toBe(p);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThan(6);
  });

  it("range-assigns partitions with the remainder to earlier consumers", () => {
    expect(rangeAssign(3, ["c2", "c1"])).toEqual({ c1: [0, 1], c2: [2] });
    expect(rangeAssign(2, ["a", "b", "c"])).toEqual({ a: [0], b: [1], c: [] });
  });

  it("preserves per-key order and routes poison messages to the DLQ", () => {
    let t = createTopic(3, ["c1", "c2"]);
    t = produce(t, "acct-1");
    t = produce(t, "acct-1", true);
    t = produce(t, "acct-1");
    for (let i = 0; i < 8; i++) t = poll(t);
    expect(lag(t).every((l) => l === 0)).toBe(true);
    expect(t.dlq).toHaveLength(1);
    const ids = t.processed.filter((m) => m.key === "acct-1").map((m) => m.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });
});

describe("chain model", () => {
  it("links blocks and only indexes confirmed events", () => {
    let c = createChain(2);
    c = submitTx(c, "0xA", "pool", { method: "stake", amount: 100 });
    c = mineBlock(c);
    expect(c.blocks[1]!.parentHash).toBe(c.blocks[0]!.hash);
    expect(indexedEvents(c)).toHaveLength(0);
    c = mineBlock(mineBlock(c));
    expect(indexedEvents(c)).toHaveLength(1);
  });

  it("reverts a withdrawal larger than the stake", () => {
    let c = createChain();
    c = submitTx(c, "0xA", "pool", { method: "withdraw", amount: 5 });
    c = mineBlock(c);
    expect(c.blocks[1]!.events).toHaveLength(0);
  });
});
