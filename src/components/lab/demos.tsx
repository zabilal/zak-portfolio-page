import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LabDemoId } from "@/content/types";

function Loading() {
  return (
    <div className="h-96 animate-pulse rounded-xl border border-line bg-surface" aria-hidden />
  );
}

/** Each simulator is its own chunk, so a page only ships the demo it shows. */
export const demos: Record<LabDemoId, ComponentType> = {
  ledger: dynamic(() => import("./LedgerSimulator").then((m) => m.LedgerSimulator), {
    loading: Loading,
  }),
  payment: dynamic(() => import("./PaymentSimulator").then((m) => m.PaymentSimulator), {
    loading: Loading,
  }),
  kafka: dynamic(() => import("./KafkaVisualizer").then((m) => m.KafkaVisualizer), {
    loading: Loading,
  }),
  chain: dynamic(() => import("./ChainExplorer").then((m) => m.ChainExplorer), {
    loading: Loading,
  }),
  "ai-pipeline": dynamic(() => import("./AiPipeline").then((m) => m.AiPipeline), {
    loading: Loading,
  }),
};

export const demoMeta: Record<LabDemoId, { title: string; description: string; project?: string }> =
  {
    payment: {
      title: "Distributed transaction simulator",
      description:
        "Step a payment through its state machine under timeouts, duplicate webhooks, provider outages and reconciliation breaks.",
      project: "payment-system",
    },
    ledger: {
      title: "Ledger simulator",
      description:
        "Post transfers as balanced journal entries, retry with the same idempotency key, and reverse without editing history.",
      project: "ledger",
    },
    kafka: {
      title: "Kafka visualiser",
      description:
        "Produce keyed events, watch murmur2 place them on partitions, rebalance consumers, and send a poison message to the DLQ.",
      project: "event-system",
    },
    chain: {
      title: "Blockchain transaction explorer",
      description:
        "Sign a contract call, mine it into a block, and watch the indexer wait for confirmations before trusting the event.",
      project: "blockchain",
    },
    "ai-pipeline": {
      title: "AI pipeline",
      description:
        "Trace a grounded question through planning, retrieval, a typed tool call and generation with citations.",
      project: "engineering-agent",
    },
  };
