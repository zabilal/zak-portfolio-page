import {
  aiSystem,
  blockchainSystem,
  deliveryPipeline,
  eventSystem,
  financialSystem,
  paymentSystem,
  platformSystem,
  ledgerSystem,
} from "./diagrams";
import type { Domain, DomainId } from "./types";

export const domains: Domain[] = [
  {
    id: "fintech",
    title: "Fintech engineering",
    short: "Fintech",
    tagline:
      "Ledgers, payments, settlement and banking systems — where correctness is the product.",
    intro: [
      "Most of my working life has been spent on software that moves money: digital and agency banking, mobile money, lending, cross-border payments and core banking integrations.",
      "In these systems an API returning 200 is not the goal. The goal is that every naira is accounted for, every retry is safe, every failure ends in a known state, and at the end of the day the numbers reconcile with the bank's.",
    ],
    capabilities: [
      {
        id: "ledger",
        title: "Ledger engineering",
        description:
          "Modelling money as balanced journal entries instead of mutable balance columns, so history is auditable and balances are derivable.",
        items: [
          "Double-entry bookkeeping",
          "Debit/credit modelling by account type",
          "Immutable transaction journals",
          "Balance computation and projections",
          "Transaction state machines",
          "Holds and reservations",
          "Reversals as compensating entries",
          "Ledger consistency checks",
        ],
      },
      {
        id: "payments",
        title: "Payment infrastructure",
        description:
          "Initiating, tracking and settling payments across providers that time out, send duplicate webhooks and occasionally disagree with you.",
        items: [
          "Payment initiation and orchestration",
          "Interbank transfers",
          "Provider integrations and failover",
          "Webhook ingestion and verification",
          "Transaction status management",
          "Retry systems with idempotency",
          "Settlement",
          "Reconciliation",
        ],
      },
      {
        id: "banking",
        title: "Banking systems",
        description:
          "Integrating with core banking and building the product surface around it: accounts, loans, asset management and transaction processing.",
        items: [
          "Core banking integrations",
          "Digital and agency banking",
          "Customer accounts and products",
          "Loans and lending workflows",
          "Asset management",
          "Banking APIs",
        ],
      },
    ],
    technologies: ["Java", "Spring Boot", "Go", "Kafka", "PostgreSQL", "Redis", "TypeScript"],
    concepts: [
      "Double-entry ledgers",
      "Idempotency",
      "Settlement",
      "Reconciliation",
      "State machines",
      "Transactional outbox",
      "Optimistic concurrency",
    ],
    diagrams: [financialSystem, ledgerSystem, paymentSystem],
    projects: ["ledger", "payment-system"],
    notes: [
      "designing-a-double-entry-ledger",
      "idempotency-in-payment-systems",
      "designing-reconciliation-systems",
    ],
  },
  {
    id: "distributed-systems",
    title: "Backend & distributed systems",
    short: "Distributed systems",
    tagline:
      "Services that stay correct when the network, the dependency and the retry all misbehave at once.",
    intro: [
      "I build backend services in Java and Go, and in TypeScript where the team and problem fit. The interesting work is rarely the happy path — it is deciding what happens when a request is retried, a consumer crashes halfway, or two writers race for the same row.",
      "I reach for patterns like CQRS, event sourcing and sagas when the constraints call for them, and avoid them when a single well-indexed table and a transaction will do.",
    ],
    capabilities: [
      {
        id: "services",
        title: "Services & APIs",
        description: "APIs designed for retries, versioning and clear failure semantics.",
        items: [
          "High-throughput backend services",
          "Microservices with owned data",
          "Idempotent API design",
          "Rate limiting and backpressure",
          "Clean Architecture and DDD boundaries",
          "API versioning",
        ],
      },
      {
        id: "apis",
        title: "Reliability patterns",
        description: "Making asynchronous processing safe to retry and easy to reason about.",
        items: [
          "Retry strategies with jittered backoff",
          "Dead-letter queues",
          "Effectively-once processing",
          "Eventual consistency",
          "Sagas and distributed transactions",
          "Circuit breaking and timeouts",
        ],
      },
      {
        id: "concurrency",
        title: "Concurrency",
        description:
          "Using the concurrency model of the language deliberately rather than by accident.",
        items: [
          "Java concurrency and virtual threads",
          "Go goroutines, channels and worker pools",
          "Reactive I/O with Vert.x",
          "Optimistic and pessimistic locking",
          "Contention analysis",
        ],
      },
    ],
    technologies: [
      "Java",
      "Go",
      "TypeScript",
      "Spring Boot",
      "Vert.x",
      "Javalin",
      "NestJS",
      "Node.js",
      "Kafka",
      "Redis",
    ],
    concepts: [
      "Domain-Driven Design",
      "Clean Architecture",
      "CQRS",
      "Event sourcing",
      "Idempotency",
      "Eventual consistency",
      "Backpressure",
      "Fault tolerance",
    ],
    diagrams: [platformSystem, eventSystem],
    projects: ["event-system", "payment-system", "ledger"],
    notes: [
      "concurrency-control-in-java",
      "go-concurrency-patterns",
      "java-vs-go-for-backend-systems",
    ],
  },
  {
    id: "data",
    title: "Data & messaging",
    short: "Data & messaging",
    tagline:
      "Relational modelling, isolation levels and event streams — the parts that decide whether the system is correct.",
    intro: [
      "Most correctness bugs I have seen in financial systems were really data bugs: a missing unique constraint, a read-modify-write at the wrong isolation level, a consumer that committed its offset before its write.",
      "Kafka gets particular attention here because it sits at the centre of most event-driven financial systems I have worked on — and because its guarantees are easy to misunderstand.",
    ],
    capabilities: [
      {
        id: "relational",
        title: "Relational data",
        description: "PostgreSQL and MySQL used as the consistency backbone, not just storage.",
        items: [
          "Schema design for financial data",
          "Indexing and query plans",
          "Transactions and isolation levels",
          "Optimistic concurrency (version columns)",
          "Pessimistic locking (SELECT … FOR UPDATE)",
          "Constraints as invariants",
        ],
      },
      {
        id: "kafka",
        title: "Kafka & event streaming",
        description: "Partitioning, ordering and failure handling for streams that carry money.",
        items: [
          "Partitioning by business key",
          "Per-key ordering guarantees",
          "Consumer groups and rebalancing",
          "Offset management",
          "Retry topics and DLQs",
          "Idempotent producers and consumers",
        ],
      },
      {
        id: "caching",
        title: "Caching & search",
        description: "Redis and Elasticsearch where they earn their place.",
        items: [
          "Distributed caching and invalidation",
          "Distributed locks and rate limits",
          "Search indexing",
          "Log pipelines with Logstash",
        ],
      },
    ],
    technologies: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Logstash", "Kafka"],
    concepts: [
      "Isolation levels",
      "Locking",
      "Indexing",
      "Partitioning",
      "Consumer groups",
      "Ordering",
      "Dead-letter queues",
    ],
    diagrams: [eventSystem],
    projects: ["event-system", "ledger"],
    notes: ["kafka-for-financial-transactions", "database-isolation-levels-explained"],
  },
  {
    id: "ai",
    title: "AI engineering lab",
    short: "AI / ML",
    tagline:
      "Exploring and engineering production AI systems at the intersection of software infrastructure, healthcare, finance and intelligent automation.",
    intro: [
      "AI is an active direction for me, not a decade of research. What I bring is the production side: services with budgets and timeouts, evaluation, audit trails, and the discipline of treating a model as an unreliable dependency.",
      "The projects here are concepts and research directions, and are labelled that way.",
    ],
    capabilities: [
      {
        id: "llm-apps",
        title: "LLM applications",
        description: "Grounded, observable applications built around model APIs.",
        items: [
          "RAG pipelines",
          "Embeddings and vector search",
          "Document processing",
          "Intelligent search",
          "AI copilots",
        ],
      },
      {
        id: "developer-infrastructure",
        title: "Agents & developer infrastructure",
        description:
          "Agents that act on repositories, with tests and review as the feedback signal.",
        items: [
          "Tool-using agents",
          "Planning and execution loops",
          "AI-assisted developer tooling",
          "Evaluation harnesses",
        ],
      },
      {
        id: "ml-infra",
        title: "AI infrastructure",
        description: "Serving models as ordinary, well-behaved backend services.",
        items: ["Model serving", "Inference queues", "Model versioning", "Healthcare AI workflows"],
      },
    ],
    technologies: [
      "Python",
      "LLMs",
      "RAG",
      "Agents",
      "Embeddings",
      "Vector search",
      "Model APIs",
      "TypeScript",
    ],
    concepts: ["Retrieval", "Grounding", "Tool use", "Evaluation", "Inference services"],
    diagrams: [aiSystem],
    projects: ["engineering-agent", "ai-radiology"],
    notes: [
      "building-ai-agents-for-software-engineering",
      "rag-architecture-for-production-systems",
      "designing-ai-inference-services",
    ],
  },
  {
    id: "blockchain",
    title: "Blockchain & Web3 engineering",
    short: "Blockchain",
    tagline:
      "Smart contracts, and the off-chain infrastructure that makes them usable: indexers, RPC and transaction lifecycle.",
    intro: [
      "I work on blockchain from both sides: the contracts, where every line is a security decision and a gas cost, and the infrastructure, where you learn that the chain is a terrible database and reorgs are real.",
      "A background in ledgers helps. A token contract is a ledger with an adversarial public API.",
    ],
    capabilities: [
      {
        id: "contracts",
        title: "Smart contracts",
        description: "Solidity on the EVM, built on audited primitives and tested adversarially.",
        items: [
          "Contract architecture",
          "ERC-20, ERC-721, ERC-1155",
          "Token and staking systems",
          "NFT systems",
          "Gas optimisation",
          "Contract security and static analysis",
        ],
      },
      {
        id: "infra",
        title: "Web3 infrastructure",
        description: "The off-chain systems that read, index and react to chain state.",
        items: [
          "RPC integrations",
          "Event listeners and indexers",
          "Transaction lifecycle and monitoring",
          "Wallet interactions and infrastructure",
          "Blockchain data processing",
        ],
      },
      {
        id: "ecosystems",
        title: "Ecosystems",
        description: "EVM chains, plus Rust for EVM experimentation.",
        items: [
          "Ethereum",
          "Polygon",
          "BNB Chain",
          "Arbitrum",
          "Base",
          "Avalanche",
          "Rust / EVM experiments",
        ],
      },
    ],
    technologies: [
      "Solidity",
      "EVM",
      "Foundry",
      "Hardhat",
      "Truffle",
      "OpenZeppelin",
      "Slither",
      "Viem",
      "Ethers.js",
      "Rust",
    ],
    concepts: [
      "Checks-effects-interactions",
      "Reentrancy",
      "Event indexing",
      "Reorg handling",
      "Gas",
      "Access control",
    ],
    diagrams: [blockchainSystem],
    projects: ["blockchain"],
    notes: ["building-blockchain-indexers", "solidity-security-fundamentals"],
  },
  {
    id: "cloud",
    title: "Cloud & infrastructure",
    short: "Cloud",
    tagline: "How software gets built, shipped, observed and kept running.",
    intro: [
      "I own what I build past the merge: containers, pipelines, infrastructure as code, and the dashboards that tell you something is wrong before a customer does.",
      "Observability is part of the architecture. If a payment is stuck, you should be able to find it, see its history and know why without reading the code.",
    ],
    capabilities: [
      {
        id: "platform",
        title: "Platform",
        description: "Reproducible environments, defined in code.",
        items: [
          "Containerisation",
          "Kubernetes and Helm",
          "Terraform",
          "Service discovery",
          "Configuration management",
          "Secrets management",
        ],
      },
      {
        id: "delivery",
        title: "Delivery",
        description: "Every change takes the same, automated path to production.",
        items: [
          "CI/CD with GitHub Actions",
          "Deployment automation",
          "Rolling releases",
          "Environment promotion",
        ],
      },
      {
        id: "operations",
        title: "Operations",
        description: "Running systems, not just deploying them.",
        items: [
          "Structured logging",
          "Metrics and alerting",
          "Tracing",
          "Scaling and high availability",
          "Linux debugging",
        ],
      },
    ],
    technologies: [
      "AWS",
      "GCP",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Helm",
      "GitHub Actions",
      "Linux",
    ],
    concepts: [
      "Infrastructure as code",
      "High availability",
      "Observability",
      "Scaling",
      "Secrets management",
    ],
    diagrams: [platformSystem, deliveryPipeline],
    projects: [],
    notes: [],
  },
  {
    id: "frontend",
    title: "Frontend & applications",
    short: "Frontend",
    tagline:
      "I can build across the stack, but my strongest focus is backend systems, distributed infrastructure and complex business domains.",
    intro: [
      "I build the interfaces too — React and Next.js on the web, Angular for structured enterprise frontends, Flutter for mobile. This site is one example.",
      "Knowing the frontend makes me a better backend engineer: I design APIs for the people who have to call them.",
    ],
    capabilities: [
      {
        id: "web",
        title: "Web",
        description: "Fast, accessible interfaces.",
        items: [
          "React",
          "Next.js",
          "Angular",
          "TypeScript",
          "Accessibility",
          "Performance budgets",
        ],
      },
      {
        id: "mobile",
        title: "Mobile",
        description: "Cross-platform apps.",
        items: ["Flutter"],
      },
    ],
    technologies: ["React", "Next.js", "Angular", "TypeScript", "Flutter"],
    concepts: ["Server rendering", "Static generation", "Accessibility"],
    diagrams: [],
    projects: [],
    notes: [],
  },
];

export function getDomain(id: string): Domain | undefined {
  return domains.find((d) => d.id === id);
}

export function domainTitle(id: DomainId): string {
  return getDomain(id)?.short ?? id;
}
