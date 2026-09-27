"use client";

import { useEffect, useState } from "react";

type Line = { topic: string; ref: string; msg: string; tone?: "ok" | "warn" | "accent" };

/** Scripted, clearly labelled as a simulation — the kinds of events the systems on this site emit. */
const script: Line[] = [
  { topic: "payment.state", ref: "pay_7Q2", msg: "SUBMITTED → PENDING" },
  { topic: "ledger.posted", ref: "tx_00a41", msg: "3 lines · Σ = 0", tone: "ok" },
  { topic: "webhook.recv", ref: "prv_9XA", msg: "duplicate · ignored", tone: "warn" },
  { topic: "kafka.commit", ref: "settle-p1", msg: "offset 4812", tone: "accent" },
  { topic: "payment.state", ref: "pay_3KD", msg: "UNKNOWN → SUCCEEDED" },
  { topic: "recon.match", ref: "batch_19", msg: "0 breaks", tone: "ok" },
  { topic: "chain.event", ref: "blk_1042", msg: "Staked(0x3f…a1, 100)", tone: "accent" },
  { topic: "agent.tests", ref: "run_58", msg: "all passing", tone: "ok" },
  { topic: "retry.enqueue", ref: "evt_x71", msg: "attempt 2/3 · backoff 4s", tone: "warn" },
  { topic: "ledger.posted", ref: "tx_00a42", msg: "reversal of tx_00a3f", tone: "ok" },
];

const VISIBLE = 4;

const toneClass = { ok: "text-ok", warn: "text-warn", accent: "text-accent" } as const;

export function EventStream() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  const lines = Array.from({ length: VISIBLE }, (_, i) => {
    const n = tick + i;
    return { n, line: script[n % script.length]! };
  });

  return (
    <div
      className="mt-3 overflow-hidden rounded-lg border border-line bg-bg-2/80 font-mono text-[0.68rem] leading-6 sm:text-[0.72rem]"
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-fg-3">
        <span>event stream</span>
        <span>simulated</span>
      </div>
      <ol className="px-3 py-2">
        {lines.map(({ n, line }, i) => (
          <li
            key={n}
            className={`grid grid-cols-[2.5rem_7.5rem_1fr] gap-2 whitespace-nowrap sm:grid-cols-[3rem_8rem_5.5rem_1fr] ${i === VISIBLE - 1 ? "enter" : ""}`}
          >
            <span className="text-fg-3 tabular">{String(1000 + n).slice(-4)}</span>
            <span className="text-fg-2">{line.topic}</span>
            <span className="hidden text-fg-3 sm:inline">{line.ref}</span>
            <span className={`truncate ${line.tone ? toneClass[line.tone] : "text-fg"}`}>
              {line.msg}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
