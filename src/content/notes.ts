import type { NoteMeta } from "./types";

/**
 * Engineering notes. A written note has a matching `src/content/writing/<slug>.mdx`.
 * To publish a planned note: write the MDX file, remove `planned`, add `readingMinutes`.
 */
export const notes: NoteMeta[] = [
  {
    slug: "designing-a-double-entry-ledger",
    title: "Designing a double-entry ledger",
    summary: "Journals, postings, normal balances and why a balance column is not a ledger.",
    domains: ["fintech", "data"],
    readingMinutes: 7,
    draft: false,
  },
  {
    slug: "idempotency-in-payment-systems",
    title: "Idempotency in payment systems",
    summary: "Idempotency keys, request fingerprints, and what to return the second time.",
    domains: ["fintech", "distributed-systems"],
    readingMinutes: 6,
    draft: false,
  },
  {
    slug: "database-isolation-levels-explained",
    title: "Database isolation levels, explained with money",
    summary:
      "Lost updates, write skew and which PostgreSQL isolation level actually prevents them.",
    domains: ["data"],
    readingMinutes: 6,
    draft: false,
  },
  {
    slug: "kafka-for-financial-transactions",
    title: "Kafka for financial transactions",
    summary:
      "Keys, ordering, offsets and the outbox — using Kafka without losing or duplicating money.",
    domains: ["data", "distributed-systems", "fintech"],
    readingMinutes: 7,
    draft: false,
  },
  {
    slug: "concurrency-control-in-java",
    title: "Concurrency control in Java",
    summary: "Locks, atomics, executors and virtual threads in transaction-heavy services.",
    domains: ["distributed-systems"],
    planned: true,
  },
  {
    slug: "building-reliable-payment-apis",
    title: "Building reliable payment APIs",
    summary: "Pending states, status endpoints and webhooks clients can trust.",
    domains: ["fintech"],
    planned: true,
  },
  {
    slug: "event-driven-architecture-in-fintech",
    title: "Event-driven architecture in fintech",
    summary: "Where events help, where they hurt, and the outbox in between.",
    domains: ["fintech", "distributed-systems"],
    planned: true,
  },
  {
    slug: "go-concurrency-patterns",
    title: "Go concurrency patterns",
    summary: "Worker pools, bounded parallelism, cancellation and errgroup.",
    domains: ["distributed-systems"],
    planned: true,
  },
  {
    slug: "java-vs-go-for-backend-systems",
    title: "Java vs Go for backend systems",
    summary: "An honest comparison from using both in production.",
    domains: ["distributed-systems"],
    planned: true,
  },
  {
    slug: "designing-reconciliation-systems",
    title: "Designing reconciliation systems",
    summary: "Matching, breaks, tolerances and the loop that closes the books.",
    domains: ["fintech"],
    planned: true,
  },
  {
    slug: "building-blockchain-indexers",
    title: "Building blockchain indexers",
    summary: "Confirmations, reorgs and turning logs into queryable state.",
    domains: ["blockchain"],
    planned: true,
  },
  {
    slug: "solidity-security-fundamentals",
    title: "Solidity security fundamentals",
    summary: "Reentrancy, access control, oracle trust and the tooling that catches mistakes.",
    domains: ["blockchain"],
    planned: true,
  },
  {
    slug: "building-ai-agents-for-software-engineering",
    title: "Building AI agents for software engineering",
    summary: "Why tests, not the model, are the source of truth.",
    domains: ["ai"],
    planned: true,
  },
  {
    slug: "rag-architecture-for-production-systems",
    title: "RAG architecture for production systems",
    summary: "Chunking, hybrid retrieval, evaluation and citations.",
    domains: ["ai"],
    planned: true,
  },
  {
    slug: "designing-ai-inference-services",
    title: "Designing AI inference services",
    summary: "Queues, batching, version pinning and audit.",
    domains: ["ai"],
    planned: true,
  },
];

export const writtenNotes = notes.filter((n) => !n.planned);
export const plannedNotes = notes.filter((n) => n.planned);

export function getNote(slug: string): NoteMeta | undefined {
  return notes.find((n) => n.slug === slug);
}
