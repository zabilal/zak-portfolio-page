/**
 * A toy EVM-style chain for the Lab: wallet → contract call → mempool → block → event → indexer.
 * Hashes are a fast non-cryptographic stand-in (FNV-1a) — this is a visual model, not a chain.
 */

export function fnvHex(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x0100019d);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return `0x${hex(h1)}${hex(h2)}${hex(h1 ^ h2)}${hex(Math.imul(h1, 31) ^ h2)}`;
}

export function shortHash(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export type ContractCall = { method: "stake" | "withdraw" | "claim"; amount: number };

export type ChainTx = {
  hash: string;
  from: string;
  to: string;
  call: ContractCall;
  nonce: number;
};

export type ChainEvent = {
  name: "Staked" | "Withdrawn" | "RewardPaid";
  user: string;
  amount: number;
  txHash: string;
};

export type Block = {
  number: number;
  hash: string;
  parentHash: string;
  txs: ChainTx[];
  events: ChainEvent[];
};

export type ChainState = {
  blocks: Block[];
  mempool: ChainTx[];
  nonces: Record<string, number>;
  staked: Record<string, number>;
  /** Blocks after which the indexer treats an event as final. */
  confirmations: number;
};

export const GENESIS: Block = {
  number: 0,
  hash: fnvHex("genesis"),
  parentHash: "0x0",
  txs: [],
  events: [],
};

export function createChain(confirmations = 2): ChainState {
  return { blocks: [GENESIS], mempool: [], nonces: {}, staked: {}, confirmations };
}

export function submitTx(
  state: ChainState,
  from: string,
  to: string,
  call: ContractCall,
): ChainState {
  const nonce = state.nonces[from] ?? 0;
  const tx: ChainTx = {
    hash: fnvHex(`${from}:${nonce}:${call.method}:${call.amount}`),
    from,
    to,
    call,
    nonce,
  };
  return {
    ...state,
    mempool: [...state.mempool, tx],
    nonces: { ...state.nonces, [from]: nonce + 1 },
  };
}

/** Executes pending transactions in order. Reverting calls are included but emit nothing. */
export function mineBlock(state: ChainState): ChainState {
  const parent = state.blocks[state.blocks.length - 1]!;
  const staked = { ...state.staked };
  const events: ChainEvent[] = [];

  for (const tx of state.mempool) {
    const current = staked[tx.from] ?? 0;
    if (tx.call.method === "stake") {
      staked[tx.from] = current + tx.call.amount;
      events.push({ name: "Staked", user: tx.from, amount: tx.call.amount, txHash: tx.hash });
    } else if (tx.call.method === "withdraw") {
      if (tx.call.amount > current) continue; // revert: insufficient stake
      staked[tx.from] = current - tx.call.amount;
      events.push({ name: "Withdrawn", user: tx.from, amount: tx.call.amount, txHash: tx.hash });
    } else if (current > 0) {
      const reward = Math.max(1, Math.floor(current / 100));
      events.push({ name: "RewardPaid", user: tx.from, amount: reward, txHash: tx.hash });
    }
  }

  const number = parent.number + 1;
  const block: Block = {
    number,
    parentHash: parent.hash,
    hash: fnvHex(`${number}:${parent.hash}:${state.mempool.map((t) => t.hash).join(",")}`),
    txs: state.mempool,
    events,
  };
  return { ...state, blocks: [...state.blocks, block], mempool: [], staked };
}

/** Events the indexer has accepted as final (at least `confirmations` blocks deep). */
export function indexedEvents(state: ChainState): (ChainEvent & { block: number })[] {
  const head = state.blocks[state.blocks.length - 1]!.number;
  return state.blocks
    .filter((b) => head - b.number >= state.confirmations)
    .flatMap((b) => b.events.map((e) => ({ ...e, block: b.number })));
}
