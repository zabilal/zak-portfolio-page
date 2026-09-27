"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { LabFrame } from "./LabFrame";

type Step = { stage: string; title: string; detail: string; data: string[]; ms: number };

/** A scripted trace. No model is called; the point is the shape of the system, not the answer. */
const trace: Step[] = [
  {
    stage: "Prompt",
    title: "User question",
    detail: "An operator asks about a stuck payment.",
    data: ['"Why did payment pay_3KD end up UNKNOWN, and is it resolved?"'],
    ms: 0,
  },
  {
    stage: "Agent",
    title: "Plan",
    detail:
      "The orchestrator decides it needs the runbook and the payment's event history, within a 4-step budget.",
    data: [
      "1. retrieve(runbook: provider timeouts)",
      "2. tool(get_payment_events, pay_3KD)",
      "3. answer with citations",
    ],
    ms: 42,
  },
  {
    stage: "Retriever",
    title: "Hybrid search",
    detail: "Keyword + vector search over internal docs; top chunks re-ranked.",
    data: [
      "0.91  runbooks/provider-timeouts.md#unknown-state",
      "0.84  adr/014-timeouts-are-not-failures.md",
      "0.62  runbooks/reconciliation.md#breaks",
    ],
    ms: 118,
  },
  {
    stage: "Tool",
    title: "get_payment_events(pay_3KD)",
    detail: "A typed, read-only tool. The agent cannot mutate payments.",
    data: [
      "SUBMITTED   → provider call timed out",
      "UNKNOWN     → status query: PENDING",
      "PENDING     → webhook prv_3KD: SUCCEEDED",
      "SETTLED     → RECONCILED",
    ],
    ms: 64,
  },
  {
    stage: "Model",
    title: "Grounded generation",
    detail: "The model sees only retrieved chunks and tool output; it is instructed to cite both.",
    data: ["input 2,140 tokens · output 146 tokens", "citations required · refusal if ungrounded"],
    ms: 910,
  },
  {
    stage: "Response",
    title: "Answer",
    detail: "Returned with sources; the full trace is stored for evaluation.",
    data: [
      "The provider call timed out, so the payment was marked UNKNOWN rather than failed [adr/014].",
      "A status query found it PENDING; the webhook confirmed success and it has since settled and reconciled [events].",
    ],
    ms: 3,
  },
];

export function AiPipeline() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const active = running && step < trace.length - 1;

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 850);
    return () => window.clearTimeout(id);
  }, [active, step]);

  const total = trace.slice(0, step + 1).reduce((sum, s) => sum + s.ms, 0);

  return (
    <LabFrame
      title="AI pipeline"
      subtitle="prompt → agent → retriever → tool → model → response"
      onReset={() => {
        setRunning(false);
        setStep(-1);
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (step >= trace.length - 1) setStep(-1);
            setRunning(true);
          }}
          disabled={active}
          className="h-9 rounded-md bg-accent px-3 text-sm font-medium text-accent-ink disabled:opacity-50"
        >
          {step >= trace.length - 1 ? "Run again" : active ? "Running…" : "Run trace"}
        </button>
        <span className="font-mono text-[0.7rem] text-fg-3">
          scripted trace · no model is called · {total} ms
        </span>
      </div>

      <ol className="mt-5 grid gap-3 md:grid-cols-6" aria-label="Pipeline stages">
        {trace.map((s, i) => (
          <li key={s.stage}>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setStep(i);
              }}
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "w-full rounded-lg border px-2 py-2 text-left transition-colors md:text-center",
                i === step
                  ? "border-accent bg-accent-soft"
                  : i < step
                    ? "border-line-2"
                    : "border-line opacity-60",
              )}
            >
              <span className="block font-mono text-[0.62rem] text-fg-3">0{i + 1}</span>
              <span className={cn("block text-sm", i <= step ? "text-fg" : "text-fg-3")}>
                {s.stage}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-4 min-h-44 rounded-lg border border-line bg-bg-2 p-4" aria-live="polite">
        {step < 0 ? (
          <p className="text-sm text-fg-3">Run the trace, or select a stage.</p>
        ) : (
          <div key={step} className="enter">
            <p className="font-mono text-[0.7rem] text-accent">
              {trace[step]!.stage.toLowerCase()} · +{trace[step]!.ms} ms
            </p>
            <p className="mt-1 font-medium text-fg">{trace[step]!.title}</p>
            <p className="mt-1 text-sm text-fg-2">{trace[step]!.detail}</p>
            <ul className="mt-3 space-y-1 font-mono text-[0.7rem] leading-relaxed text-fg-2">
              {trace[step]!.data.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </LabFrame>
  );
}
