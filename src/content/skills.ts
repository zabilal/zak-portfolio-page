import type { DomainId, Language } from "./types";

/**
 * Proficiency is described by the kind of experience, not an invented percentage.
 */
export const tierLabels = {
  production: {
    label: "Production",
    description: "Used to build and operate systems in production.",
  },
  strong: {
    label: "Strong working knowledge",
    description: "Used regularly; comfortable designing with it.",
  },
  exploring: {
    label: "Currently expanding",
    description: "Actively learning and building with it outside production.",
  },
} as const;

export const languages: Language[] = [
  {
    name: "Java",
    tier: "production",
    context: "Banking and payment services, concurrency-heavy backends",
  },
  { name: "Go", tier: "production", context: "High-throughput services, workers, event consumers" },
  {
    name: "TypeScript",
    tier: "production",
    context: "Node.js services, NestJS APIs, React and Next.js frontends",
  },
  { name: "JavaScript", tier: "strong", context: "Node.js, browser, Web3 tooling" },
  { name: "SQL", tier: "strong", context: "Relational modelling, query tuning, financial data" },
  { name: "Solidity", tier: "strong", context: "EVM smart contracts, token and staking systems" },
  { name: "Python", tier: "exploring", context: "ML tooling, LLM applications, data work" },
  { name: "Rust", tier: "exploring", context: "Systems programming and EVM experimentation" },
];

export type SkillGroup = { title: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Java", "Go", "TypeScript", "JavaScript", "Solidity", "SQL", "Python", "Rust"],
  },
  { title: "Backend", items: ["Spring Boot", "Vert.x", "Javalin", "Node.js", "NestJS", "Express"] },
  {
    title: "Distributed systems",
    items: [
      "Kafka",
      "Redis",
      "Event-driven architecture",
      "Microservices",
      "CQRS",
      "Event sourcing",
    ],
  },
  { title: "Databases", items: ["PostgreSQL", "MySQL", "MongoDB", "Elasticsearch", "Logstash"] },
  {
    title: "Blockchain",
    items: [
      "Solidity",
      "EVM",
      "Foundry",
      "Hardhat",
      "OpenZeppelin",
      "Slither",
      "Viem",
      "Ethers.js",
    ],
  },
  {
    title: "AI",
    items: ["Python", "LLMs", "RAG", "Agents", "Embeddings", "Vector search", "Model APIs"],
  },
  {
    title: "Infrastructure",
    items: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Helm", "GitHub Actions", "Linux"],
  },
  { title: "Frontend & mobile", items: ["React", "Next.js", "Angular", "TypeScript", "Flutter"] },
];

/** Short descriptors revealed on hover/focus of a technology chip. */
export const glossary: Record<string, string> = {
  Java: "JVM services · Concurrency · Banking backends",
  Go: "Goroutines · Workers · High-throughput services",
  TypeScript: "Typed Node.js services · Frontends",
  JavaScript: "Node.js · Browser · Web3 tooling",
  SQL: "Relational modelling · Query plans · Reporting",
  Solidity: "Smart contracts · EVM · Token protocols",
  Python: "ML tooling · LLM applications · Data",
  Rust: "Systems programming · EVM experiments",
  "Spring Boot": "JVM services · Transactions · Integrations",
  "Vert.x": "Reactive JVM · Event loop · Non-blocking I/O",
  Javalin: "Lightweight JVM HTTP services",
  "Node.js": "Async I/O · API services · Workers",
  NestJS: "Structured Node.js services · DI · Modules",
  Express: "Minimal Node.js HTTP layer",
  Kafka: "Event streaming · Distributed messaging · Financial transaction processing",
  Redis: "Caching · Distributed locks · Rate limiting",
  "Event-driven architecture": "Loose coupling · Async workflows · Replay",
  Microservices: "Service boundaries · Independent deploys",
  CQRS: "Separate write and read models",
  "Event sourcing": "State as an append-only event log",
  PostgreSQL: "Relational modelling · Transactions · Indexing · Financial data",
  MySQL: "Relational storage · Replication",
  MongoDB: "Document storage · Flexible schemas",
  Elasticsearch: "Search · Aggregations · Log analytics",
  Logstash: "Log pipelines · Ingestion · Transformation",
  EVM: "Execution model · Gas · Storage layout",
  Foundry: "Solidity testing · Fuzzing · Scripts",
  Hardhat: "Contract development · Local networks",
  Truffle: "Legacy contract tooling",
  OpenZeppelin: "Audited contract primitives · Access control",
  Slither: "Static analysis for Solidity",
  Viem: "Typed EVM client · RPC",
  "Ethers.js": "EVM client · Wallets · Contract calls",
  LLMs: "Model APIs · Prompting · Evaluation",
  RAG: "Retrieval · Grounding · Citations",
  Agents: "Tool use · Planning · Feedback loops",
  Embeddings: "Vector representations · Similarity",
  "Vector search": "ANN indexes · Hybrid retrieval",
  "Model APIs": "Hosted inference · Rate limits · Cost",
  AWS: "Compute · Networking · Managed data",
  GCP: "Compute · Managed services",
  Docker: "Containers · Reproducible builds",
  Kubernetes: "Orchestration · Scaling · Rollouts",
  Terraform: "Infrastructure as code · Plans · State",
  Helm: "Kubernetes packaging · Releases",
  "GitHub Actions": "CI/CD pipelines",
  Linux: "Processes · Networking · Debugging",
  React: "Component UI · State",
  "Next.js": "Server rendering · Static generation",
  Angular: "Structured SPAs · Enterprise frontends",
  Flutter: "Cross-platform mobile",
};

export type MatrixRow = {
  domain: string;
  domainId: DomainId;
  technologies: string[];
  concepts: string[];
  projects: string[];
};

export const stackMatrix: MatrixRow[] = [
  {
    domain: "Fintech",
    domainId: "fintech",
    technologies: ["Java", "Go", "Kafka", "PostgreSQL"],
    concepts: ["Double-entry ledgers", "Payments", "Settlement", "Reconciliation"],
    projects: ["ledger", "payment-system"],
  },
  {
    domain: "Distributed systems",
    domainId: "distributed-systems",
    technologies: ["Go", "Java", "Kafka", "Redis"],
    concepts: ["Concurrency", "Consistency", "Idempotency", "Backpressure"],
    projects: ["event-system", "payment-system"],
  },
  {
    domain: "Data & messaging",
    domainId: "data",
    technologies: ["PostgreSQL", "Elasticsearch", "Kafka", "Redis"],
    concepts: ["Isolation levels", "Indexing", "Partitioning", "Caching"],
    projects: ["event-system", "ledger"],
  },
  {
    domain: "AI",
    domainId: "ai",
    technologies: ["Python", "LLMs", "Embeddings", "Vector search"],
    concepts: ["RAG", "Agents", "Inference services"],
    projects: ["engineering-agent", "ai-radiology"],
  },
  {
    domain: "Blockchain",
    domainId: "blockchain",
    technologies: ["Solidity", "Foundry", "OpenZeppelin", "Viem"],
    concepts: ["Smart contracts", "EVM", "Event indexing"],
    projects: ["blockchain"],
  },
  {
    domain: "Infrastructure",
    domainId: "cloud",
    technologies: ["AWS", "Kubernetes", "Terraform", "GitHub Actions"],
    concepts: ["CI/CD", "Scaling", "Observability"],
    projects: [],
  },
];
