export type Principle = { title: string; body: string };

export const principles: Principle[] = [
  {
    title: "Correctness before cleverness",
    body: "In financial systems a fast wrong answer is worse than a slow right one. Optimise after the invariants are enforced and tested.",
  },
  {
    title: "Design for failure",
    body: "Networks fail. Services fail. Dependencies fail. A production system assumes all three and decides in advance what happens.",
  },
  {
    title: "Make state explicit",
    body: "Named states and validated transitions turn 'what happened to this payment?' from an investigation into a query.",
  },
  {
    title: "Idempotency everywhere it matters",
    body: "Anything that can be retried will be. Payments, webhooks and consumers must produce the same result the second time.",
  },
  {
    title: "Simple systems scale better",
    body: "A well-indexed table and a transaction beat a clever distributed design until they demonstrably don't.",
  },
  {
    title: "Architecture follows constraints",
    body: "CQRS, event sourcing and microservices are answers to specific problems. Start from the problem.",
  },
  {
    title: "Observability is architecture",
    body: "Logs, metrics, traces and audit trails are designed in, not bolted on after the first incident.",
  },
  {
    title: "Build for change",
    body: "Requirements will move. Clear boundaries let a system evolve without being rewritten.",
  },
];

export type Exploration = { title: string; body: string; domain: string };

/** Active, non-professional work. Kept visibly separate from completed experience. */
export const exploring: Exploration[] = [
  {
    title: "AI engineering",
    body: "Building intelligent systems with LLMs, agents, RAG and the infrastructure that makes them reliable.",
    domain: "ai",
  },
  {
    title: "Blockchain",
    body: "Smart contracts, EVM internals, protocol engineering and decentralised applications.",
    domain: "blockchain",
  },
  {
    title: "Distributed systems",
    body: "Going deeper on concurrency, Kafka, consistency models, fault tolerance and high-throughput design.",
    domain: "distributed-systems",
  },
  {
    title: "Developer infrastructure",
    body: "Autonomous coding agents and AI-assisted software engineering workflows.",
    domain: "ai",
  },
];

export type CareerStage = {
  id: string;
  title: string;
  body: string;
  technologies: string[];
  projects: string[];
  branch?: boolean;
};

/** The through-line: increasingly complex problems, increasingly powerful tools. */
export const careerPath: CareerStage[] = [
  {
    id: "software",
    title: "Software engineering",
    body: "Learning to ship working software, then learning that working is the beginning.",
    technologies: ["Java", "JavaScript", "SQL"],
    projects: [],
  },
  {
    id: "backend",
    title: "Backend engineering",
    body: "APIs, data models and services — and a growing interest in what happens behind the endpoint.",
    technologies: ["Spring Boot", "Node.js", "PostgreSQL"],
    projects: [],
  },
  {
    id: "fintech",
    title: "Fintech & digital banking",
    body: "Building banking products, where a bug is someone's money and every edge case is real.",
    technologies: ["Java", "Spring Boot", "PostgreSQL"],
    projects: ["ledger"],
  },
  {
    id: "payments",
    title: "Payments at volume",
    body: "Mobile money, agent networks and cross-border transfers. Timeouts, duplicate webhooks, reconciliation.",
    technologies: ["Go", "Kafka", "Redis"],
    projects: ["payment-system", "event-system"],
  },
  {
    id: "infrastructure",
    title: "Financial infrastructure",
    body: "Ledgers, settlement and core banking integration — the systems other systems depend on.",
    technologies: ["Java", "Go", "Kafka", "Kubernetes"],
    projects: ["ledger", "payment-system"],
  },
  {
    id: "blockchain",
    title: "Blockchain",
    body: "Ledgers with a public, adversarial API. Solidity, EVM and the off-chain systems around them.",
    technologies: ["Solidity", "Foundry", "Viem"],
    projects: ["blockchain"],
    branch: true,
  },
  {
    id: "ai",
    title: "AI / ML",
    body: "Treating models as unreliable dependencies and building the production systems around them.",
    technologies: ["Python", "LLMs", "RAG", "Agents"],
    projects: ["engineering-agent", "ai-radiology"],
    branch: true,
  },
];
