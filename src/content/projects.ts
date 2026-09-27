import {
  agentSystem,
  eventSystem,
  ledgerSystem,
  paymentSystem,
  radiologySystem,
  stakingSystem,
} from "./diagrams";
import type { Project, ProjectStatus } from "./types";

export const statusLabels: Record<ProjectStatus, { label: string; description: string }> = {
  reference: {
    label: "Reference architecture",
    description:
      "Generalised from professional work. Employer systems, data and specifics are not disclosed.",
  },
  prototype: { label: "Prototype", description: "Working code exists; not production." },
  building: { label: "Currently building", description: "In active development." },
  research: {
    label: "Research",
    description: "Investigation and design; exploratory code at most.",
  },
  concept: {
    label: "Concept",
    description: "An engineering and product direction at the design stage.",
  },
};

/** Marker for results that can only be filled in with verified, non-confidential numbers. */
export const OUTCOME_PENDING = "Verified, non-confidential results to be added.";

export const projects: Project[] = [
  {
    slug: "ledger",
    index: "01",
    title: "Financial Ledger",
    category: ["Fintech", "Distributed Systems"],
    domains: ["fintech", "data", "distributed-systems"],
    summary:
      "A double-entry ledger where balances are derived from an immutable journal, every posting is balanced by construction, and retries cannot move money twice.",
    status: "reference",
    disclosure:
      "A reference design drawn from building banking and payment systems. It does not describe any employer's ledger, schema or volumes.",
    technologies: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Redis"],
    concepts: [
      "Double-entry",
      "Idempotency",
      "Optimistic concurrency",
      "Reversals",
      "Holds",
      "Auditability",
    ],
    featured: true,
    diagram: ledgerSystem,
    demo: "ledger",
    problem: {
      heading: "Problem",
      body: [
        "A balance column that services update directly is the most common way financial systems go wrong. It cannot explain itself: when a customer disputes a balance, there is no history that adds up to the number.",
        "Concurrent updates make it worse. Two debits racing on the same account can both pass a balance check and overdraw it.",
      ],
    },
    context: {
      heading: "Context",
      body: [
        "Banking and payment products need the same core: customer accounts, internal accounts (fees, suspense, settlement), transfers between them, and an audit trail that finance and regulators can rely on.",
      ],
      bullets: [
        "Amounts must be exact — integer minor units, never floating point.",
        "Every state change must be explainable after the fact.",
        "Clients and upstream services will retry; the ledger must be safe under retries.",
        "Throughput matters, but never more than correctness.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "Money only moves by posting a journal entry: a set of lines, each a debit or credit against one account, that must sum to zero. Balances are a projection of the journal, kept alongside it for fast reads and versioned for concurrency control.",
        "The posting engine writes journal lines, balance projections and an outbox row in one database transaction. A relay publishes outbox rows to Kafka, so downstream consumers never observe money that did not move.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "Journal is append-only. Corrections are reversals — new entries with opposite signs — never updates.",
        "Idempotency keys are stored with a hash of the request. Same key and same body returns the original result; same key with a different body is rejected.",
        "Optimistic concurrency on balance rows (a version column) instead of long-held locks; conflicts retry the posting.",
        "Holds are first-class: available balance = ledger balance − active holds.",
        "Account normal balance (debit or credit) is part of the account type, so sign conventions live in one place.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Deriving balances purely from the journal on every read is the most obviously correct design, but it gets slower as history grows. Keeping a projection in the same transaction keeps reads fast at the cost of a second write — acceptable because both commit or neither does.",
        "Optimistic concurrency performs well until a single account becomes hot (a settlement or fee account touched by every transaction). Hot accounts are better handled with sub-accounts or batched postings than with ever more retries.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Java and Spring Boot for the service, PostgreSQL for the journal and projections with constraints enforcing the invariants, Kafka for ledger events, Redis only for short-lived request deduplication in front of the durable idempotency table.",
      ],
      bullets: [
        "CHECK constraints and a deferred trigger assert each entry sums to zero.",
        "Unique constraint on (idempotency_key) makes duplicate postings impossible, not just unlikely.",
        "Daily trial balance: total debits equal total credits across all accounts.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "The hard part is not the posting logic but the edges: partial reversals, holds that expire while a transfer is in flight, and reconciling internal suspense accounts against what the bank actually settled.",
      ],
    },
    outcome: {
      heading: "Outcome",
      body: [
        "The design gives a small set of guarantees that can be tested: every entry balances, history is immutable, a retried request never posts twice, and any balance can be recomputed from the journal.",
        OUTCOME_PENDING,
      ],
    },
    learned: {
      heading: "What I learned",
      body: [
        "Put invariants in the database, not only in code. Code paths multiply; constraints do not.",
        "Make the ledger boring. Every clever optimisation in the posting path is something an auditor will eventually ask you to explain.",
      ],
    },
  },
  {
    slug: "payment-system",
    index: "02",
    title: "Payment Processing Platform",
    category: ["Payments", "Distributed Systems"],
    domains: ["fintech", "distributed-systems"],
    summary:
      "A payment lifecycle built around an explicit state machine, idempotent APIs, retry-safe provider calls, webhook deduplication and daily reconciliation.",
    status: "reference",
    disclosure:
      "A reference design reflecting work on payments, mobile money and cross-border transfers. Provider names, volumes and internal details are omitted.",
    technologies: ["Go", "Java", "Kafka", "PostgreSQL", "Redis"],
    concepts: [
      "Idempotency",
      "State machines",
      "Retries",
      "Provider failover",
      "Webhooks",
      "Reconciliation",
    ],
    featured: true,
    diagram: paymentSystem,
    demo: "payment",
    problem: {
      heading: "Problem",
      body: [
        "A payment crosses systems you do not control. Providers time out after they have already debited the customer, deliver the same webhook three times, or report success hours later.",
        "The system must reach the correct final state anyway, and be able to prove it.",
      ],
    },
    context: {
      heading: "Context",
      body: [
        "Transfers, collections and payouts across banks, switches and payment providers, often over networks with variable reliability.",
      ],
      bullets: [
        "A timeout is not a failure — it is an unknown.",
        "Customers and partners retry aggressively.",
        "Some providers only confirm through webhooks; some only through status queries; some through daily files.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "The Payment API accepts a request with an idempotency key and hands it to the transaction service, which owns the payment's state. Each state transition is validated against a table and written with an outbox event.",
        "Provider calls are made by workers, not the request thread. Webhooks are verified, stored raw, deduplicated by provider reference and turned into internal events. Settlement posts to the ledger; reconciliation compares internal records against provider statements.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "State machine with explicit transitions: INITIATED → SUBMITTED → PENDING → SUCCEEDED | FAILED, with UNKNOWN for timeouts.",
        "UNKNOWN is resolved by status queries and reconciliation, never by guessing.",
        "Retries use exponential backoff with jitter and a bound; only operations the provider documents as idempotent are retried blindly.",
        "Failover to a secondary provider only before submission is confirmed, never after — otherwise you risk paying twice.",
        "Webhook handlers acknowledge fast and process asynchronously.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Synchronous APIs are simpler for clients but push provider latency and failures into the request path. Accepting the payment and returning a pending status is harder to integrate with but far more robust.",
        "Aggressive failover improves success rates but increases the risk of duplicate payouts. The rule is conservative: fail over only when you can prove the first provider did not accept the payment.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Go workers for provider calls and webhook processing, a Java or Go transaction service depending on the team, PostgreSQL for state with the outbox pattern, Kafka between stages and Redis for short-lived locks and rate limits.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "Every provider has its own definition of 'pending', its own status codes and its own failure modes. Normalising them into one internal state model without losing information is most of the work.",
      ],
    },
    outcome: {
      heading: "Outcome",
      body: [
        "Every payment has one owner, one current state and a complete event history. Retries at any layer are safe; unknown outcomes are surfaced rather than hidden.",
        OUTCOME_PENDING,
      ],
    },
    learned: {
      heading: "What I learned",
      body: [
        "Design for the unknown state first. Success and failure are easy; the payment that is neither is where money gets lost.",
        "Reconciliation is not a back-office report. It is the system's final correctness check, and it should be built with the same care as the API.",
      ],
    },
  },
  {
    slug: "event-system",
    index: "03",
    title: "High-Throughput Event System",
    category: ["Distributed Systems", "Data"],
    domains: ["distributed-systems", "data"],
    summary:
      "Kafka topology for financial events: partitioning by business key for ordering, consumer groups for scale, bounded retries and dead-letter queues that preserve context.",
    status: "reference",
    disclosure:
      "A reference design. Topic names, partition counts and throughput figures from real systems are not disclosed.",
    technologies: ["Kafka", "Go", "Java", "PostgreSQL"],
    concepts: [
      "Partitioning",
      "Ordering",
      "Consumer groups",
      "Retry topics",
      "DLQ",
      "Effectively-once",
    ],
    featured: true,
    diagram: eventSystem,
    demo: "kafka",
    problem: {
      heading: "Problem",
      body: [
        "Downstream systems — settlement, notifications, reporting, fraud checks — need every transaction event, in order per account, without slowing the transaction path. One bad message must not stall a partition.",
      ],
    },
    context: {
      heading: "Context",
      body: [],
      bullets: [
        "Order matters per account, not globally.",
        "Consumers crash, deploy and rebalance constantly.",
        "Kafka delivers at least once; duplicates must be harmless.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "Producers key events by account ID, so all events for an account land on one partition and are consumed in order. Consumer groups scale horizontally up to the partition count.",
        "A consumer commits its offset only after its side effect is durable, and side effects are idempotent upserts keyed by event ID. Transient failures move to a delayed retry topic; exhausted retries go to a DLQ with the payload, error and attempt history.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "Business key partitioning (account ID), not random, to get per-account ordering.",
        "Transactional outbox on the producer side instead of dual writes.",
        "Effectively-once via idempotent consumers, rather than relying on Kafka transactions end to end.",
        "Retry topics instead of in-consumer sleep loops, so one message cannot block a partition.",
        "DLQ messages are replayable by tooling, not just inspectable.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Moving a message to a retry topic breaks strict ordering for that key. For events where order is essential, the consumer instead parks the key and holds later events for it — more complex, but correct.",
        "More partitions allow more consumers but increase rebalance time and broker overhead. Partition count is a capacity decision made up front.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Go consumers with bounded worker pools per partition, Java producers using the outbox relay, PostgreSQL for idempotent side effects.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "The classic failure is a rebalance during a deploy: a consumer loses a partition after writing but before committing, and the next owner processes the same events again. It stops being an incident only when every side effect is idempotent and offsets are committed after durable writes.",
      ],
    },
    outcome: {
      heading: "Outcome",
      body: [
        "A topology where duplicates are harmless, ordering holds where it matters and a poison message costs one DLQ entry instead of an outage.",
        OUTCOME_PENDING,
      ],
    },
    learned: {
      heading: "What I learned",
      body: [
        "Exactly-once is a property of the whole system, not a Kafka setting. Idempotent consumers are cheaper and easier to reason about.",
      ],
    },
  },
  {
    slug: "ai-radiology",
    index: "04",
    title: "AI Radiology Platform",
    category: ["AI", "Healthcare"],
    domains: ["ai"],
    summary:
      "A conceptual platform connecting imaging, EMR and clinical workflows with AI inference as an assistive, audited step — the clinician always decides.",
    status: "concept",
    disclosure:
      "An engineering and product concept. No diagnostic accuracy, clinical validation or regulatory status is claimed.",
    technologies: ["Python", "TypeScript", "PostgreSQL", "Kafka", "Docker"],
    concepts: [
      "DICOM",
      "FHIR",
      "Inference services",
      "Model versioning",
      "Audit",
      "Human-in-the-loop",
    ],
    featured: true,
    diagram: radiologySystem,
    problem: {
      heading: "Problem",
      body: [
        "Radiology departments juggle imaging systems, patient records and reporting tools that rarely talk to each other. Adding AI to that picture without an engineering foundation just adds another disconnected box.",
      ],
    },
    context: {
      heading: "Context",
      body: [],
      bullets: [
        "Patient data is sensitive; de-identification and access control are foundational.",
        "Models change; every result must record which model version produced it.",
        "AI output is a suggestion for a clinician, never an autonomous decision.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "Studies flow from PACS through an imaging pipeline that de-identifies before inference. An inference service runs pinned model versions from a registry and attaches suggestions to the study. The clinical workflow presents them to the radiologist, whose report is the only output of record.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "Inference is asynchronous and queued; the clinical workflow never blocks on a model.",
        "Each inference record stores input reference, model version and output for audit.",
        "Integration through standards (DICOM, HL7/FHIR) rather than point-to-point adapters.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Standards-based integration is slower to start than custom adapters but is the only approach that survives more than one hospital.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Planned: Python inference workers, a TypeScript application layer, PostgreSQL for workflow state, Kafka between pipeline stages, containerised deployment.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "Open questions: data governance, clinical validation partners and the regulatory path. These are prerequisites, not afterthoughts.",
      ],
    },
    outcome: {
      heading: "Current state",
      body: ["Architecture and workflow design. No clinical deployment."],
    },
    learned: {
      heading: "What I'm learning",
      body: [
        "In healthcare AI the model is the smallest part of the system. Workflow, audit and trust are the product.",
      ],
    },
  },
  {
    slug: "blockchain",
    index: "05",
    title: "Blockchain Staking Protocol",
    category: ["Blockchain"],
    domains: ["blockchain"],
    summary:
      "A staking protocol design: small single-purpose contracts, reward-per-share accounting, audited access control and events shaped for indexing.",
    status: "concept",
    disclosure: "A protocol design exercise. Not deployed to mainnet; not audited.",
    technologies: ["Solidity", "Foundry", "OpenZeppelin", "Slither", "Viem"],
    concepts: ["ERC-20", "Staking", "Rewards", "Reentrancy", "Gas", "Event indexing"],
    featured: true,
    diagram: stakingSystem,
    demo: "chain",
    problem: {
      heading: "Problem",
      body: [
        "Naive staking contracts loop over stakers to distribute rewards — gas cost grows with users until the function can no longer execute. They also often mix token custody, reward maths and admin powers in one contract.",
      ],
    },
    context: {
      heading: "Context",
      body: [],
      bullets: [
        "Contracts are immutable once deployed and hold user funds.",
        "Every storage write costs gas.",
        "Off-chain systems need to reconstruct positions from events.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "A StakingPool handles deposits and withdrawals; a RewardDistributor tracks accumulated reward per share so each user's reward is computed in O(1) on interaction. AccessControl and Pausable from OpenZeppelin gate admin functions. An indexer consumes events to serve positions and history.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "Reward-per-share accounting instead of iterating stakers.",
        "Checks-effects-interactions ordering plus ReentrancyGuard.",
        "SafeERC20 for token transfers.",
        "Events carry every field the indexer needs, so no state is read back from the chain.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Upgradeable proxies allow fixes but introduce admin trust and storage-layout risk. For a staking pool, immutability with a pause switch is the more honest default.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Solidity with Foundry for unit, fuzz and invariant tests; Slither for static analysis; Viem for the client and indexer.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "Rounding in reward maths: always round in the protocol's favour and test the invariant that total claimable never exceeds total funded.",
      ],
    },
    outcome: {
      heading: "Current state",
      body: ["Design and contract architecture. Not deployed or audited."],
    },
    learned: {
      heading: "What I'm learning",
      body: [
        "Ledger thinking transfers directly: a token contract is a ledger whose API is public and adversarial.",
      ],
    },
  },
  {
    slug: "engineering-agent",
    index: "06",
    title: "AI Engineering Agent",
    category: ["AI", "Developer Infrastructure"],
    domains: ["ai"],
    summary:
      "Research into agents that understand a repository, plan, implement, run tests, review and fix — with tests and human review as the source of truth.",
    status: "research",
    disclosure: "A research direction. Exploratory, not a product.",
    technologies: ["Python", "TypeScript", "LLMs", "Docker"],
    concepts: ["Agents", "Tool use", "Code search", "Sandboxing", "Evaluation"],
    featured: true,
    diagram: agentSystem,
    demo: "ai-pipeline",
    problem: {
      heading: "Problem",
      body: [
        "Code generation is easy to demo and hard to trust. The open question is how to build a loop that produces changes a senior engineer would merge.",
      ],
    },
    context: {
      heading: "Context",
      body: [],
      bullets: [
        "Repositories are large; context windows are not.",
        "Model output is non-deterministic.",
        "Tests, linters and type checkers are deterministic.",
      ],
    },
    architecture: {
      heading: "Architecture",
      body: [
        "A pipeline of narrow agents — understanding, planning, implementation, review and fix — around a sandboxed test runner. Deterministic tools provide the feedback; the loop terminates on passing tests and review, or on a budget.",
      ],
    },
    decisions: {
      heading: "Engineering decisions",
      body: [],
      bullets: [
        "Sandboxed execution for every command.",
        "Budgets on steps, tokens and wall-clock time.",
        "Every step is logged for evaluation.",
        "The output is a pull request for a human, never a direct push.",
      ],
    },
    tradeoffs: {
      heading: "Tradeoffs",
      body: [
        "Many narrow agents are easier to evaluate than one general agent but add orchestration overhead and more places to lose context.",
      ],
    },
    implementation: {
      heading: "Implementation",
      body: [
        "Exploratory work in Python and TypeScript against hosted model APIs, with Docker sandboxes.",
      ],
    },
    challenges: {
      heading: "Challenges",
      body: [
        "Evaluation. Without a benchmark of real tasks from real repositories, it is impossible to know whether a change to the loop helped.",
      ],
    },
    outcome: {
      heading: "Current state",
      body: ["Research and prototyping of individual stages."],
    },
    learned: {
      heading: "What I'm learning",
      body: [
        "Agents are distributed systems with an unreliable component. Timeouts, retries, idempotency and observability apply.",
      ],
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const caseStudyOrder = [
  "problem",
  "context",
  "architecture",
  "decisions",
  "tradeoffs",
  "implementation",
  "challenges",
  "outcome",
  "learned",
] as const;
