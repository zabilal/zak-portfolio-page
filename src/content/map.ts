import type { DomainId } from "./types";

export type MapNode = {
  id: string;
  label: string;
  /** Grid position on a 3×3 layout. */
  col: 0 | 1 | 2;
  row: 0 | 1 | 2;
  summary: string;
  technologies: string[];
  concepts: string[];
  projects: string[];
  href: string;
  domain: DomainId;
  related: string[];
};

/** "What I build" — the site's central navigation concept. */
export const mapNodes: MapNode[] = [
  {
    id: "financial",
    label: "Financial systems",
    col: 0,
    row: 0,
    summary: "Ledgers, accounts and banking workflows where every balance must be explainable.",
    technologies: ["Java", "Spring Boot", "PostgreSQL"],
    concepts: ["Double-entry", "Holds", "Reversals", "Audit"],
    projects: ["ledger"],
    href: "/engineering/fintech",
    domain: "fintech",
    related: ["payments", "data", "distributed"],
  },
  {
    id: "payments",
    label: "Payments",
    col: 1,
    row: 0,
    summary: "Payment orchestration, provider integrations, settlement and reconciliation.",
    technologies: ["Go", "Kafka", "Redis"],
    concepts: ["Idempotency", "State machines", "Failover", "Reconciliation"],
    projects: ["payment-system"],
    href: "/engineering/fintech#payments",
    domain: "fintech",
    related: ["financial", "apis", "distributed"],
  },
  {
    id: "blockchain",
    label: "Blockchain",
    col: 2,
    row: 0,
    summary: "Smart contracts on the EVM and the indexers and RPC infrastructure around them.",
    technologies: ["Solidity", "Foundry", "OpenZeppelin", "Viem"],
    concepts: ["ERC standards", "Gas", "Security", "Indexing"],
    projects: ["blockchain"],
    href: "/engineering/blockchain",
    domain: "blockchain",
    related: ["financial", "data", "devtools"],
  },
  {
    id: "apis",
    label: "APIs",
    col: 0,
    row: 1,
    summary: "Retry-safe, versioned APIs with clear failure semantics.",
    technologies: ["Spring Boot", "NestJS", "Javalin", "Vert.x"],
    concepts: ["Idempotency keys", "Rate limiting", "Versioning"],
    projects: ["payment-system"],
    href: "/engineering/distributed-systems#services",
    domain: "distributed-systems",
    related: ["payments", "distributed", "cloud"],
  },
  {
    id: "distributed",
    label: "Distributed systems",
    col: 1,
    row: 1,
    summary: "Event-driven services that stay correct under retries, crashes and races.",
    technologies: ["Go", "Java", "Kafka", "Redis"],
    concepts: ["Consistency", "Concurrency", "Backpressure", "Sagas"],
    projects: ["event-system", "payment-system"],
    href: "/engineering/distributed-systems",
    domain: "distributed-systems",
    related: ["financial", "payments", "apis", "data", "cloud", "ai"],
  },
  {
    id: "ai",
    label: "AI / ML",
    col: 2,
    row: 1,
    summary: "LLM applications, agents and inference services — an active direction.",
    technologies: ["Python", "LLMs", "Embeddings", "Vector search"],
    concepts: ["RAG", "Agents", "Evaluation"],
    projects: ["engineering-agent", "ai-radiology"],
    href: "/engineering/ai",
    domain: "ai",
    related: ["distributed", "devtools", "data"],
  },
  {
    id: "cloud",
    label: "Cloud infrastructure",
    col: 0,
    row: 2,
    summary: "Containers, Kubernetes, Terraform and pipelines — owning code past the merge.",
    technologies: ["AWS", "GCP", "Kubernetes", "Terraform"],
    concepts: ["IaC", "CI/CD", "Observability"],
    projects: [],
    href: "/engineering/cloud",
    domain: "cloud",
    related: ["apis", "distributed", "data"],
  },
  {
    id: "data",
    label: "Data systems",
    col: 1,
    row: 2,
    summary: "Relational modelling, isolation levels, Kafka streams, caching and search.",
    technologies: ["PostgreSQL", "Kafka", "Redis", "Elasticsearch"],
    concepts: ["Isolation", "Partitioning", "Indexing"],
    projects: ["event-system", "ledger"],
    href: "/engineering/data",
    domain: "data",
    related: ["financial", "distributed", "cloud", "blockchain", "ai"],
  },
  {
    id: "devtools",
    label: "Developer tools",
    col: 2,
    row: 2,
    summary: "AI-assisted engineering workflows and autonomous coding agents — research.",
    technologies: ["Python", "TypeScript", "Docker"],
    concepts: ["Agents", "Sandboxing", "Evaluation"],
    projects: ["engineering-agent"],
    href: "/engineering/ai#developer-infrastructure",
    domain: "ai",
    related: ["ai", "blockchain"],
  },
];
