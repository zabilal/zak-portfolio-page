/**
 * A small, pure double-entry ledger used by the Lab's ledger simulator.
 * Amounts are integer minor units (kobo). State is immutable; every operation returns new state.
 */

export type Side = "debit" | "credit";
export type AccountType = "asset" | "liability" | "revenue" | "expense" | "equity";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  /** Customer accounts may not go below zero; internal accounts may. */
  allowNegative?: boolean;
};

export type Line = { accountId: string; side: Side; amount: number };

export type Entry = {
  id: string;
  seq: number;
  description: string;
  lines: Line[];
  idempotencyKey: string;
  fingerprint: string;
  reverses?: string;
  reversedBy?: string;
};

export type LedgerState = {
  accounts: Record<string, Account>;
  entries: Entry[];
  keys: Record<string, string>;
  seq: number;
};

export type PostResult =
  | { ok: true; state: LedgerState; entry: Entry; replayed: boolean }
  | { ok: false; error: LedgerError };

export type LedgerError =
  | "UNBALANCED"
  | "INVALID_AMOUNT"
  | "UNKNOWN_ACCOUNT"
  | "TOO_FEW_LINES"
  | "INSUFFICIENT_FUNDS"
  | "SAME_ACCOUNT"
  | "IDEMPOTENCY_KEY_REUSED"
  | "ALREADY_REVERSED"
  | "UNKNOWN_ENTRY";

export const errorMessages: Record<LedgerError, string> = {
  UNBALANCED: "Debits and credits do not sum to zero.",
  INVALID_AMOUNT: "Amounts must be positive whole numbers of minor units.",
  UNKNOWN_ACCOUNT: "Account does not exist.",
  TOO_FEW_LINES: "An entry needs at least two lines.",
  INSUFFICIENT_FUNDS: "Insufficient available balance.",
  SAME_ACCOUNT: "Source and destination must differ.",
  IDEMPOTENCY_KEY_REUSED: "Idempotency key reused with a different request.",
  ALREADY_REVERSED: "Entry has already been reversed.",
  UNKNOWN_ENTRY: "Entry does not exist.",
};

/** Asset and expense accounts increase with debits; the rest increase with credits. */
export function normalSide(type: AccountType): Side {
  return type === "asset" || type === "expense" ? "debit" : "credit";
}

export function createLedger(accounts: Account[]): LedgerState {
  return {
    accounts: Object.fromEntries(accounts.map((a) => [a.id, a])),
    entries: [],
    keys: {},
    seq: 0,
  };
}

/** Balance in the account's own normal direction (positive = what a customer would call a balance). */
export function balanceOf(state: LedgerState, accountId: string): number {
  const account = state.accounts[accountId];
  if (!account) return 0;
  const normal = normalSide(account.type);
  let total = 0;
  for (const entry of state.entries) {
    for (const line of entry.lines) {
      if (line.accountId !== accountId) continue;
      total += line.side === normal ? line.amount : -line.amount;
    }
  }
  return total;
}

export function trialBalance(state: LedgerState): {
  debits: number;
  credits: number;
  balanced: boolean;
} {
  let debits = 0;
  let credits = 0;
  for (const entry of state.entries) {
    for (const line of entry.lines) {
      if (line.side === "debit") debits += line.amount;
      else credits += line.amount;
    }
  }
  return { debits, credits, balanced: debits === credits };
}

function fingerprintOf(description: string, lines: Line[]): string {
  const canonical = [...lines]
    .map((l) => `${l.accountId}:${l.side}:${l.amount}`)
    .sort()
    .join("|");
  return `${description}#${canonical}`;
}

export function entryId(seq: number): string {
  // Deterministic, readable IDs keep the simulator and tests stable.
  return `tx_${seq.toString(36).padStart(5, "0")}`;
}

export function postEntry(
  state: LedgerState,
  input: { description: string; lines: Line[]; idempotencyKey: string; reverses?: string },
): PostResult {
  const fingerprint = fingerprintOf(input.description, input.lines);

  const existingId = state.keys[input.idempotencyKey];
  if (existingId) {
    const existing = state.entries.find((e) => e.id === existingId)!;
    if (existing.fingerprint !== fingerprint) return { ok: false, error: "IDEMPOTENCY_KEY_REUSED" };
    return { ok: true, state, entry: existing, replayed: true };
  }

  if (input.lines.length < 2) return { ok: false, error: "TOO_FEW_LINES" };
  for (const line of input.lines) {
    if (!Number.isSafeInteger(line.amount) || line.amount <= 0)
      return { ok: false, error: "INVALID_AMOUNT" };
    if (!state.accounts[line.accountId]) return { ok: false, error: "UNKNOWN_ACCOUNT" };
  }
  const net = input.lines.reduce((sum, l) => sum + (l.side === "debit" ? l.amount : -l.amount), 0);
  if (net !== 0) return { ok: false, error: "UNBALANCED" };

  // Check every account that this entry would move against its normal direction.
  for (const accountId of new Set(input.lines.map((l) => l.accountId))) {
    const account = state.accounts[accountId]!;
    if (account.allowNegative) continue;
    const normal = normalSide(account.type);
    const delta = input.lines
      .filter((l) => l.accountId === accountId)
      .reduce((sum, l) => sum + (l.side === normal ? l.amount : -l.amount), 0);
    if (balanceOf(state, accountId) + delta < 0) return { ok: false, error: "INSUFFICIENT_FUNDS" };
  }

  const seq = state.seq + 1;
  const entry: Entry = {
    id: entryId(seq),
    seq,
    description: input.description,
    lines: input.lines.map((l) => ({ ...l })),
    idempotencyKey: input.idempotencyKey,
    fingerprint,
    reverses: input.reverses,
  };

  let entries = [...state.entries, entry];
  if (input.reverses) {
    entries = entries.map((e) => (e.id === input.reverses ? { ...e, reversedBy: entry.id } : e));
  }

  return {
    ok: true,
    replayed: false,
    entry,
    state: { ...state, entries, seq, keys: { ...state.keys, [input.idempotencyKey]: entry.id } },
  };
}

/**
 * Move money between two liability (customer) accounts, optionally charging a fee.
 * Debiting a liability decreases what the bank owes that customer; crediting increases it.
 */
export function transfer(
  state: LedgerState,
  input: {
    from: string;
    to: string;
    amount: number;
    fee?: number;
    feeAccount?: string;
    idempotencyKey: string;
  },
): PostResult {
  if (input.from === input.to) return { ok: false, error: "SAME_ACCOUNT" };
  const fee = input.fee ?? 0;
  const lines: Line[] = [
    { accountId: input.from, side: "debit", amount: input.amount + fee },
    { accountId: input.to, side: "credit", amount: input.amount },
  ];
  if (fee > 0 && input.feeAccount)
    lines.push({ accountId: input.feeAccount, side: "credit", amount: fee });
  const names = [
    state.accounts[input.from]?.name ?? input.from,
    state.accounts[input.to]?.name ?? input.to,
  ];
  return postEntry(state, {
    description: `Transfer ${names[0]} → ${names[1]}`,
    lines,
    idempotencyKey: input.idempotencyKey,
  });
}

/** Reverse an entry by posting a compensating entry with every side swapped. History is never edited. */
export function reverse(state: LedgerState, id: string, idempotencyKey: string): PostResult {
  const original = state.entries.find((e) => e.id === id);
  if (!original) return { ok: false, error: "UNKNOWN_ENTRY" };
  if (original.reversedBy && state.keys[idempotencyKey] !== original.reversedBy) {
    return { ok: false, error: "ALREADY_REVERSED" };
  }
  return postEntry(state, {
    description: `Reversal of ${original.id}`,
    lines: original.lines.map((l) => ({ ...l, side: l.side === "debit" ? "credit" : "debit" })),
    idempotencyKey,
    reverses: original.id,
  });
}

export function formatNaira(minor: number): string {
  const sign = minor < 0 ? "−" : "";
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100).toLocaleString("en-NG");
  const kobo = (abs % 100).toString().padStart(2, "0");
  return `${sign}₦${whole}.${kobo}`;
}
