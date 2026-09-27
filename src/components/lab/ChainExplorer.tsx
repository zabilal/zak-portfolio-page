"use client";

import { useState } from "react";
import {
  createChain,
  indexedEvents,
  mineBlock,
  shortHash,
  submitTx,
  type ContractCall,
} from "@/lib/chain";
import { cn } from "@/lib/cn";
import { LabFrame } from "./LabFrame";

const WALLETS = [
  "0xA11ce0000000000000000000000000000000a1",
  "0xB0b0000000000000000000000000000000000b2",
];
const POOL = "0x5741c1e0000000000000000000000000000f00d1";
const STAGES = ["Wallet", "Smart contract", "Transaction", "Block", "Event", "Indexer"] as const;

const short = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-2)}`;

export function ChainExplorer() {
  const [chain, setChain] = useState(() => createChain(2));
  const [wallet, setWallet] = useState(WALLETS[0]!);
  const [method, setMethod] = useState<ContractCall["method"]>("stake");
  const [amount, setAmount] = useState(100);
  const [stage, setStage] = useState(-1);

  const indexed = indexedEvents(chain);
  const head = chain.blocks.at(-1)!;
  const pendingEvents = chain.blocks
    .filter((b) => head.number - b.number < chain.confirmations)
    .reduce((n, b) => n + b.events.length, 0);

  function send() {
    setChain((c) => submitTx(c, wallet, POOL, { method, amount }));
    setStage(2);
  }

  function mine() {
    setChain((c) => mineBlock(c));
    setStage((s) => (s >= 2 ? 4 : s));
  }

  const effectiveStage = stage === 4 && indexed.length > 0 && pendingEvents === 0 ? 5 : stage;

  return (
    <LabFrame
      title="Blockchain transaction explorer"
      subtitle="wallet → contract → tx → block → event → indexer"
      onReset={() => {
        setChain(createChain(2));
        setStage(-1);
      }}
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label="Lifecycle">
        {STAGES.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            {i > 0 && (
              <span aria-hidden className="text-fg-3">
                →
              </span>
            )}
            <span
              aria-current={i === effectiveStage ? "step" : undefined}
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-[0.66rem]",
                i === effectiveStage
                  ? "border-accent bg-accent-soft text-accent"
                  : i < effectiveStage
                    ? "border-line-2 text-fg"
                    : "border-line text-fg-3",
              )}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-5 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-3">
          <div>
            <label htmlFor="chain-wallet" className="mb-1 block font-mono text-[0.68rem] text-fg-3">
              Wallet
            </label>
            <select
              id="chain-wallet"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              className={input}
            >
              {WALLETS.map((w) => (
                <option key={w} value={w}>
                  {short(w)} · staked {chain.staked[w] ?? 0}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_5rem] gap-2">
            <div>
              <label
                htmlFor="chain-method"
                className="mb-1 block font-mono text-[0.68rem] text-fg-3"
              >
                StakingPool.
              </label>
              <select
                id="chain-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as ContractCall["method"])}
                className={input}
              >
                <option value="stake">stake(amount)</option>
                <option value="withdraw">withdraw(amount)</option>
                <option value="claim">claim()</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="chain-amount"
                className="mb-1 block font-mono text-[0.68rem] text-fg-3"
              >
                amount
              </label>
              <input
                id="chain-amount"
                type="number"
                min={1}
                value={amount}
                disabled={method === "claim"}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                className={cn(input, "tabular disabled:opacity-40")}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink"
            >
              Sign & send
            </button>
            <button
              type="button"
              onClick={mine}
              className="h-9 rounded-md border border-line-2 px-3 text-sm text-fg"
            >
              Mine block
            </button>
          </div>
          <div className="rounded-lg border border-line p-3">
            <p className="eyebrow">Mempool</p>
            <ul className="mt-2 space-y-1 font-mono text-[0.68rem]">
              {chain.mempool.length === 0 && <li className="text-fg-3">empty</li>}
              {chain.mempool.map((tx) => (
                <li key={tx.hash} className="enter text-fg-2">
                  {shortHash(tx.hash)} · {tx.call.method}
                  {tx.call.method !== "claim" && `(${tx.call.amount})`} · nonce {tx.nonce}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <p className="mb-2 eyebrow">Chain · head #{head.number}</p>
            <ol className="flex gap-2 overflow-x-auto pb-2" aria-label="Blocks">
              {[...chain.blocks]
                .reverse()
                .slice(0, 8)
                .map((b) => {
                  const confirmations = head.number - b.number;
                  return (
                    <li
                      key={b.hash}
                      className="enter w-40 shrink-0 rounded-lg border border-line bg-bg-2 p-2.5 font-mono text-[0.64rem]"
                    >
                      <div className="flex justify-between">
                        <span className="text-fg">#{b.number}</span>
                        <span
                          className={confirmations >= chain.confirmations ? "text-ok" : "text-warn"}
                        >
                          {b.number === 0 ? "genesis" : `${confirmations} conf`}
                        </span>
                      </div>
                      <div className="mt-1.5 text-fg-3">hash {shortHash(b.hash)}</div>
                      <div className="text-fg-3">
                        parent {b.number === 0 ? "—" : shortHash(b.parentHash)}
                      </div>
                      <div className="mt-1.5 text-fg-2">
                        {b.txs.length} tx · {b.events.length} event
                        {b.events.length === 1 ? "" : "s"}
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>

          <div className="rounded-lg border border-line p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="eyebrow">Indexer · {chain.confirmations} confirmations required</p>
              {pendingEvents > 0 && (
                <span className="font-mono text-[0.66rem] text-warn">
                  {pendingEvents} awaiting confirmation
                </span>
              )}
            </div>
            <ul className="mt-2 space-y-1 font-mono text-[0.68rem]">
              {indexed.length === 0 && <li className="text-fg-3">No finalised events yet.</li>}
              {[...indexed]
                .reverse()
                .slice(0, 6)
                .map((e) => (
                  <li key={`${e.txHash}-${e.name}`} className="enter text-fg-2">
                    <span className="text-accent">{e.name}</span>({short(e.user)}, {e.amount}) ·
                    block #{e.block}
                  </li>
                ))}
            </ul>
          </div>
          <p className="text-xs leading-relaxed text-fg-3">
            A withdrawal larger than the stake reverts: it is mined but emits nothing. Events are
            indexed only after enough confirmations to survive a shallow reorg. Hashes here are a
            non-cryptographic stand-in.
          </p>
        </div>
      </div>
    </LabFrame>
  );
}

const input =
  "h-9 w-full rounded-md border border-line-2 bg-bg-2 px-2 text-sm text-fg outline-none focus-visible:border-accent";
