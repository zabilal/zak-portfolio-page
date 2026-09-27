"use client";

import { useEffect, useMemo, useState } from "react";
import {
  apply,
  createPayment,
  describeEvent,
  scenarios,
  type ApplyOutcome,
  type Payment,
  type PaymentState,
} from "@/lib/payment";
import { cn } from "@/lib/cn";
import { LabFrame } from "./LabFrame";

const mainPath: PaymentState[] = [
  "INITIATED",
  "SUBMITTED",
  "PENDING",
  "SUCCEEDED",
  "SETTLED",
  "RECONCILED",
];
const exceptional: PaymentState[] = ["UNKNOWN", "FAILED"];

type LogRow = {
  step: number;
  event: string;
  outcome: ApplyOutcome;
  state: PaymentState;
  provider: string;
};

function outcomeText(o: ApplyOutcome): { text: string; tone: string } {
  switch (o.kind) {
    case "transition":
      return { text: `${o.from} → ${o.to}`, tone: "text-fg" };
    case "duplicate":
      return { text: `no-op · ${o.reason}`, tone: "text-warn" };
    case "retry":
      return {
        text: `retry ${o.attempt} · backoff ${2 ** o.attempt}s + jitter`,
        tone: "text-warn",
      };
    case "failover":
      return { text: "failover → fallback provider", tone: "text-accent" };
    case "rejected":
      return { text: `rejected · ${o.reason}`, tone: "text-err" };
  }
}

/** Replays a scenario up to `step`; the simulator is a pure function of (scenario, step). */
function replay(scenarioId: string, step: number) {
  const scenario = scenarios.find((s) => s.id === scenarioId)!;
  let payment: Payment = createPayment(`pay_${scenarioId.slice(0, 3)}${scenario.events.length}f2`);
  const log: LogRow[] = [];
  scenario.events.slice(0, step).forEach((event, i) => {
    const result = apply(payment, event);
    payment = result.payment;
    log.push({
      step: i + 1,
      event: describeEvent(event),
      outcome: result.outcome,
      state: payment.state,
      provider: payment.provider,
    });
  });
  return { scenario, payment, log };
}

export function PaymentSimulator() {
  const [scenarioId, setScenarioId] = useState("timeout");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { scenario, payment, log } = useMemo(() => replay(scenarioId, step), [scenarioId, step]);
  const done = step >= scenario.events.length;
  const visited = new Set<PaymentState>(["INITIATED", ...payment.history.map((h) => h.state)]);

  const running = playing && !done;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 900);
    return () => window.clearTimeout(id);
  }, [running, step]);

  function choose(id: string) {
    setScenarioId(id);
    setStep(0);
    setPlaying(false);
  }

  const lastBreak = log.at(-1)?.outcome.kind === "rejected" && scenarioId === "break";

  return (
    <LabFrame
      title="Distributed transaction simulator"
      subtitle="State machine · retries · idempotent webhooks"
      onReset={() => choose(scenarioId)}
    >
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Scenario">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === scenarioId}
            onClick={() => choose(s.id)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              s.id === scenarioId
                ? "border-accent/60 bg-accent-soft text-fg"
                : "border-line text-fg-3 hover:text-fg",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-2">{scenario.description}</p>

      <div className="mt-5 rounded-lg border border-line bg-bg-2 p-3 sm:p-4">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label="Payment states">
          {mainPath.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden className="text-fg-3">
                  →
                </span>
              )}
              <StatePill state={s} current={payment.state === s} visited={visited.has(s)} />
            </li>
          ))}
        </ol>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="font-mono text-[0.65rem] text-fg-3">exceptional</span>
          {exceptional.map((s) => (
            <StatePill key={s} state={s} current={payment.state === s} visited={visited.has(s)} />
          ))}
          {lastBreak && (
            <span className="rounded border border-err/40 px-2 py-0.5 font-mono text-[0.68rem] text-err">
              RECON BREAK raised
            </span>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line font-mono text-[0.7rem] sm:grid-cols-4">
        {[
          ["transaction", payment.id],
          ["state", payment.state],
          ["provider", payment.provider],
          ["attempts", String(payment.attempts)],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface px-3 py-2">
            <dt className="text-fg-3">{k}</dt>
            <dd className="mt-0.5 text-fg">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => (done ? choose(scenarioId) : setPlaying(!running))}
          className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink"
        >
          {done ? "Replay" : running ? "Pause" : "Run"}
        </button>
        <button
          type="button"
          disabled={done || running}
          onClick={() => setStep((s) => s + 1)}
          className="h-9 rounded-md border border-line-2 px-3 text-sm text-fg disabled:opacity-40"
        >
          Step
        </button>
        <span className="font-mono text-[0.7rem] text-fg-3">
          event {step}/{scenario.events.length} · consumer settlement-worker
        </span>
      </div>

      <ol
        className="mt-4 space-y-1 font-mono text-[0.7rem]"
        aria-live="polite"
        aria-label="Event log"
      >
        {log.length === 0 && (
          <li className="text-fg-3">No events yet. Run or step through the scenario.</li>
        )}
        {log.map((row) => {
          const o = outcomeText(row.outcome);
          return (
            <li
              key={row.step}
              className="enter grid grid-cols-[1.5rem_1fr] gap-2 sm:grid-cols-[1.5rem_16rem_1fr]"
            >
              <span className="text-fg-3 tabular">{row.step}</span>
              <span className="text-fg-2">{row.event}</span>
              <span className={cn("col-start-2 sm:col-start-auto", o.tone)}>{o.text}</span>
            </li>
          );
        })}
      </ol>
    </LabFrame>
  );
}

function StatePill({
  state,
  current,
  visited,
}: {
  state: PaymentState;
  current: boolean;
  visited: boolean;
}) {
  return (
    <span
      aria-current={current ? "step" : undefined}
      className={cn(
        "inline-flex rounded border px-1.5 py-0.5 font-mono text-[0.64rem] transition-colors sm:px-2 sm:text-[0.68rem]",
        current
          ? state === "FAILED"
            ? "border-err bg-err/10 text-err"
            : state === "UNKNOWN"
              ? "border-warn bg-warn/10 text-warn"
              : "border-accent bg-accent-soft text-accent"
          : visited
            ? "border-line-2 text-fg"
            : "border-line text-fg-3",
      )}
    >
      {state}
    </span>
  );
}
