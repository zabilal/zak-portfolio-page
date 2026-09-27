import type { Diagram } from "./types";

/*
 * Diagrams are laid out on a 720-unit-wide canvas. Nodes are 160 wide and 56 tall unless `w`
 * is set; rows sit 96 units apart. Layout is data so diagrams stay consistent across pages.
 * All diagrams are generalised — none describe an employer's internal topology.
 */

const L = 40;
const C = 280;
const R = 520;

export const financialSystem: Diagram = {
  id: "financial-system",
  title: "Financial system — reference topology",
  caption:
    "A generalised shape for a banking or payments backend. Money moves only through the ledger; everything downstream consumes ledger events.",
  width: 720,
  height: 632,
  nodes: [
    {
      id: "client",
      label: "Mobile / Web",
      sub: "customer & agent apps",
      x: C,
      y: 0,
      tone: "muted",
    },
    {
      id: "gateway",
      label: "API Gateway",
      sub: "auth · rate limits",
      x: C,
      y: 96,
      detail:
        "Terminates TLS, authenticates, applies per-client rate limits and forwards idempotency keys.",
    },
    {
      id: "accounts",
      label: "Account Service",
      sub: "customers · products",
      x: L,
      y: 192,
      detail:
        "Owns customer and account lifecycle: opening, status, limits, KYC tier. Never mutates balances directly.",
    },
    {
      id: "txn",
      label: "Transaction Service",
      sub: "states · idempotency",
      x: R,
      y: 192,
      tone: "accent",
      detail:
        "Validates intent, deduplicates by idempotency key and drives each transaction through explicit states.",
    },
    {
      id: "ledger",
      label: "Ledger",
      sub: "double-entry · immutable",
      x: C,
      y: 288,
      tone: "accent",
      detail:
        "The source of truth for money. Every posting is balanced; history is never updated in place.",
    },
    {
      id: "kafka",
      label: "Kafka",
      sub: "ledger events · outbox",
      x: C,
      y: 384,
      detail:
        "Ledger commits publish through a transactional outbox so downstream systems never see money that did not move.",
    },
    { id: "settlement", label: "Settlement", sub: "net positions", x: L, y: 480 },
    { id: "recon", label: "Reconciliation", sub: "match · break · resolve", x: C, y: 480 },
    {
      id: "notify",
      label: "Notifications",
      sub: "push · SMS · email",
      x: R,
      y: 480,
      tone: "muted",
    },
    {
      id: "network",
      label: "Payment network",
      sub: "banks · switches",
      x: L,
      y: 576,
      tone: "external",
    },
  ],
  edges: [
    { from: "client", to: "gateway", flow: true },
    { from: "gateway", to: "accounts" },
    { from: "gateway", to: "txn", flow: true },
    { from: "accounts", to: "ledger", dashed: true, label: "open accounts" },
    { from: "txn", to: "ledger", flow: true, label: "post" },
    { from: "ledger", to: "kafka", flow: true },
    { from: "kafka", to: "settlement", flow: true },
    { from: "kafka", to: "recon" },
    { from: "kafka", to: "notify" },
    { from: "settlement", to: "network", flow: true },
    { from: "network", to: "recon", dashed: true, label: "statements" },
  ],
};

export const aiSystem: Diagram = {
  id: "ai-system",
  title: "LLM application — orchestration",
  caption:
    "The orchestrator is ordinary backend software: it owns retries, timeouts, budgets and audit. The model is one dependency among several.",
  width: 720,
  height: 376,
  nodes: [
    { id: "client", label: "Client", x: C, y: 0, tone: "muted" },
    { id: "api", label: "API", sub: "auth · quotas", x: C, y: 96 },
    {
      id: "orch",
      label: "AI Orchestrator",
      sub: "plan · route · guard",
      x: C,
      y: 192,
      tone: "accent",
      detail:
        "Builds context, chooses tools, enforces token and latency budgets, and records every step for evaluation.",
    },
    { id: "llm", label: "LLM", sub: "hosted · served", x: 12, y: 320, w: 120 },
    { id: "vdb", label: "Vector DB", sub: "embeddings", x: 156, y: 320, w: 120 },
    { id: "tools", label: "Tools", sub: "typed actions", x: 300, y: 320, w: 120 },
    { id: "rag", label: "Retrieval", sub: "hybrid search", x: 444, y: 320, w: 120 },
    { id: "memory", label: "Memory", sub: "session state", x: 588, y: 320, w: 120 },
  ],
  edges: [
    { from: "client", to: "api", flow: true },
    { from: "api", to: "orch", flow: true },
    { from: "orch", to: "llm", flow: true },
    { from: "orch", to: "vdb" },
    { from: "orch", to: "tools" },
    { from: "orch", to: "rag", flow: true },
    { from: "orch", to: "memory" },
  ],
};

export const blockchainSystem: Diagram = {
  id: "blockchain-system",
  title: "dApp — write path and read path",
  caption:
    "Writes go through the user's wallet to the chain. Reads come from an indexer that turns contract events into queryable state — the chain is not a database.",
  width: 720,
  height: 440,
  nodes: [
    { id: "frontend", label: "Frontend", sub: "React · Viem", x: L, y: 0, tone: "muted" },
    { id: "wallet", label: "Wallet", sub: "signs transactions", x: L, y: 96 },
    { id: "rpc", label: "RPC", sub: "node provider", x: L, y: 192, tone: "external" },
    {
      id: "contract",
      label: "Smart contract",
      sub: "Solidity · EVM",
      x: L,
      y: 288,
      tone: "accent",
      detail:
        "Holds the rules that must be trustless. Everything else stays off-chain where it is cheaper and easier to change.",
    },
    { id: "chain", label: "Blockchain", sub: "blocks · logs", x: L, y: 384, tone: "external" },
    {
      id: "indexer",
      label: "Indexer",
      sub: "logs · reorg-aware",
      x: R,
      y: 384,
      tone: "accent",
      detail:
        "Follows new blocks, decodes logs, waits for confirmations and rolls back state on reorgs.",
    },
    { id: "db", label: "Database", sub: "PostgreSQL", x: R, y: 192 },
    { id: "backend", label: "Backend API", sub: "read models", x: R, y: 0 },
  ],
  edges: [
    { from: "frontend", to: "wallet", flow: true },
    { from: "wallet", to: "rpc", flow: true },
    { from: "rpc", to: "contract", flow: true },
    { from: "contract", to: "chain", flow: true },
    { from: "chain", to: "indexer", flow: true, label: "logs" },
    { from: "indexer", to: "db", flow: true },
    { from: "db", to: "backend", flow: true },
    { from: "backend", to: "frontend", dashed: true, label: "read API" },
  ],
};

export const platformSystem: Diagram = {
  id: "platform-system",
  title: "Service platform — runtime",
  caption:
    "Client → gateway → services → Kafka → data stores and external providers. Each service owns its data; integration happens through events.",
  width: 720,
  height: 440,
  nodes: [
    { id: "client", label: "Clients", x: C, y: 0, tone: "muted" },
    { id: "gateway", label: "API Gateway", sub: "ingress · TLS · limits", x: C, y: 96 },
    { id: "svc-a", label: "Payments", sub: "service", x: L, y: 192 },
    { id: "svc-b", label: "Accounts", sub: "service", x: C, y: 192 },
    { id: "svc-c", label: "Integrations", sub: "service", x: R, y: 192 },
    { id: "kafka", label: "Kafka", sub: "event backbone", x: C, y: 288, tone: "accent" },
    { id: "pg", label: "PostgreSQL", sub: "per-service schema", x: L, y: 384 },
    { id: "es", label: "Elasticsearch", sub: "search · logs", x: C, y: 384 },
    {
      id: "ext",
      label: "External providers",
      sub: "banks · KYC · SMS",
      x: R,
      y: 384,
      tone: "external",
    },
  ],
  edges: [
    { from: "client", to: "gateway", flow: true },
    { from: "gateway", to: "svc-a", flow: true },
    { from: "gateway", to: "svc-b" },
    { from: "gateway", to: "svc-c" },
    { from: "svc-a", to: "kafka", flow: true },
    { from: "svc-b", to: "kafka" },
    { from: "svc-c", to: "kafka" },
    { from: "svc-a", to: "pg" },
    { from: "kafka", to: "es", flow: true, label: "Logstash" },
    { from: "svc-c", to: "ext", flow: true },
  ],
};

export const deliveryPipeline: Diagram = {
  id: "delivery-pipeline",
  title: "Delivery pipeline",
  caption:
    "Every change takes the same path to production. Clusters and networks are provisioned with Terraform; releases are Helm charts; nothing is configured by hand.",
  width: 720,
  height: 176,
  nodes: [
    { id: "commit", label: "Commit", sub: "PR · review", x: 0, y: 0, w: 150 },
    { id: "ci", label: "CI", sub: "lint · test · scan", x: 190, y: 0, w: 150, tone: "accent" },
    { id: "build", label: "Image build", sub: "Docker", x: 380, y: 0, w: 150 },
    { id: "registry", label: "Registry", sub: "signed images", x: 570, y: 0, w: 150 },
    { id: "helm", label: "Helm release", sub: "config · secrets refs", x: 570, y: 120, w: 150 },
    {
      id: "k8s",
      label: "Kubernetes",
      sub: "rolling deploy",
      x: 380,
      y: 120,
      w: 150,
      tone: "accent",
    },
    { id: "obs", label: "Observability", sub: "logs · metrics · traces", x: 190, y: 120, w: 150 },
  ],
  edges: [
    { from: "commit", to: "ci", flow: true },
    { from: "ci", to: "build", flow: true },
    { from: "build", to: "registry", flow: true },
    { from: "registry", to: "helm", flow: true },
    { from: "helm", to: "k8s", flow: true },
    { from: "k8s", to: "obs", flow: true },
    { from: "obs", to: "commit", dashed: true, label: "feedback" },
  ],
};

export const ledgerSystem: Diagram = {
  id: "ledger-system",
  title: "Ledger — posting path",
  caption:
    "A transfer becomes exactly one balanced journal entry, written atomically with its outbox event.",
  width: 720,
  height: 440,
  nodes: [
    { id: "req", label: "Transfer request", sub: "Idempotency-Key", x: C, y: 0, tone: "muted" },
    {
      id: "txn",
      label: "Transaction service",
      sub: "validate · authorise",
      x: C,
      y: 96,
      detail:
        "Checks account status and limits, then asks the ledger to post. Holds a lock only for the accounts involved.",
    },
    { id: "idem", label: "Idempotency keys", sub: "request hash → result", x: R, y: 96 },
    { id: "holds", label: "Holds", sub: "reserved funds", x: L, y: 96 },
    {
      id: "post",
      label: "Posting engine",
      sub: "one DB transaction",
      x: C,
      y: 192,
      tone: "accent",
      detail:
        "Writes journal lines, updates balance projections and inserts the outbox row in a single transaction.",
    },
    { id: "journal", label: "Journal", sub: "append-only lines", x: L, y: 288, tone: "accent" },
    { id: "balances", label: "Balances", sub: "projection · versioned", x: C, y: 288 },
    { id: "outbox", label: "Outbox", sub: "same transaction", x: R, y: 288 },
    { id: "audit", label: "Audit & reporting", sub: "trial balance", x: L, y: 384, tone: "muted" },
    { id: "kafka", label: "Kafka", sub: "ledger.posted", x: R, y: 384 },
  ],
  edges: [
    { from: "req", to: "txn", flow: true },
    { from: "txn", to: "idem", label: "dedupe" },
    { from: "txn", to: "holds", dashed: true, label: "reserve" },
    { from: "txn", to: "post", flow: true },
    { from: "post", to: "journal", flow: true },
    { from: "post", to: "balances" },
    { from: "post", to: "outbox", flow: true },
    { from: "journal", to: "audit" },
    { from: "outbox", to: "kafka", flow: true, label: "relay" },
  ],
};

export const paymentSystem: Diagram = {
  id: "payment-system",
  title: "Payment lifecycle",
  caption:
    "Client → Payment API → Transaction Service → Provider → Webhook → Settlement → Reconciliation. Every hop can fail, so every hop is retry-safe.",
  width: 720,
  height: 632,
  nodes: [
    { id: "client", label: "Client", sub: "app · partner", x: C, y: 0, tone: "muted" },
    { id: "api", label: "Payment API", sub: "Idempotency-Key", x: C, y: 96 },
    { id: "idem", label: "Idempotency store", sub: "key → response", x: L, y: 96 },
    {
      id: "txn",
      label: "Transaction service",
      sub: "explicit state machine",
      x: C,
      y: 192,
      tone: "accent",
      detail:
        "Owns the payment's state. Transitions are validated against a table; illegal transitions are rejected, not patched.",
    },
    { id: "store", label: "Transaction DB", sub: "state + outbox", x: L, y: 192 },
    {
      id: "provider",
      label: "Provider (primary)",
      sub: "bank / switch",
      x: C,
      y: 288,
      tone: "external",
    },
    {
      id: "fallback",
      label: "Provider (fallback)",
      sub: "on sustained failure",
      x: R,
      y: 288,
      tone: "external",
    },
    {
      id: "webhook",
      label: "Webhook handler",
      sub: "verify · dedupe · enqueue",
      x: C,
      y: 384,
      detail:
        "Verifies signatures, stores the raw payload, deduplicates by provider reference and acknowledges fast.",
    },
    { id: "settle", label: "Settlement", sub: "net & post", x: C, y: 480 },
    { id: "ledger", label: "Ledger", sub: "balanced postings", x: L, y: 480, tone: "accent" },
    {
      id: "recon",
      label: "Reconciliation",
      sub: "internal vs provider",
      x: C,
      y: 576,
      tone: "accent",
      detail:
        "Matches internal records against provider statements and raises breaks for anything that does not agree.",
    },
    {
      id: "statements",
      label: "Provider statements",
      sub: "daily files / APIs",
      x: R,
      y: 576,
      tone: "external",
    },
  ],
  edges: [
    { from: "client", to: "api", flow: true },
    { from: "api", to: "idem", label: "dedupe" },
    { from: "api", to: "txn", flow: true },
    { from: "txn", to: "store" },
    { from: "txn", to: "provider", flow: true, label: "submit" },
    { from: "txn", to: "fallback", dashed: true, label: "failover" },
    { from: "provider", to: "webhook", flow: true, label: "callback" },
    { from: "fallback", to: "webhook", dashed: true },
    { from: "webhook", to: "settle", flow: true },
    { from: "settle", to: "ledger", flow: true, label: "post" },
    { from: "settle", to: "recon" },
    { from: "statements", to: "recon", flow: true },
  ],
};

export const eventSystem: Diagram = {
  id: "event-system",
  title: "Kafka topology — partitioned, retryable",
  caption:
    "Keys pin related events to one partition, so order holds per account. Failures leave the hot path through retry topics; poison messages end in a DLQ with context.",
  width: 720,
  height: 536,
  nodes: [
    { id: "p-api", label: "Payment API", sub: "producer", x: L, y: 0, tone: "muted" },
    { id: "p-ledger", label: "Ledger", sub: "producer (outbox)", x: R, y: 0, tone: "muted" },
    { id: "part0", label: "partition 0", sub: "key-ordered", x: L, y: 120 },
    { id: "part1", label: "partition 1", sub: "key-ordered", x: C, y: 120 },
    { id: "part2", label: "partition 2", sub: "key-ordered", x: R, y: 120 },
    {
      id: "c1",
      label: "Consumer 1",
      sub: "group: settlement",
      x: 150,
      y: 240,
      tone: "accent",
      detail: "Owns partitions 0 and 1. Commits offsets only after its database write succeeds.",
    },
    {
      id: "c2",
      label: "Consumer 2",
      sub: "group: settlement",
      x: 410,
      y: 240,
      tone: "accent",
      detail:
        "Owns partition 2. On rebalance, partitions move between consumers without breaking per-key order.",
    },
    { id: "retry", label: "Retry topic", sub: "delayed · bounded", x: L, y: 360 },
    { id: "db", label: "PostgreSQL", sub: "idempotent upsert", x: C, y: 360 },
    {
      id: "dlq",
      label: "Dead-letter queue",
      sub: "payload + error",
      x: L,
      y: 480,
      tone: "external",
    },
  ],
  edges: [
    { from: "p-api", to: "part0", flow: true },
    { from: "p-api", to: "part1" },
    { from: "p-ledger", to: "part2", flow: true },
    { from: "part0", to: "c1", flow: true },
    { from: "part1", to: "c1" },
    { from: "part2", to: "c2", flow: true },
    { from: "c1", to: "db", flow: true },
    { from: "c2", to: "db" },
    { from: "c1", to: "retry", dashed: true, label: "transient" },
    { from: "retry", to: "dlq", dashed: true, label: "exhausted" },
  ],
};

export const radiologySystem: Diagram = {
  id: "radiology-system",
  title: "AI-assisted radiology — conceptual architecture",
  caption:
    "Concept. The model produces a suggestion attached to a study; a clinician always makes the decision. No diagnostic performance is claimed.",
  width: 720,
  height: 536,
  nodes: [
    { id: "clinician", label: "Patient / Clinician", x: C, y: 0, tone: "muted" },
    { id: "app", label: "Radiology app", sub: "worklist · viewer", x: C, y: 96 },
    { id: "emr", label: "EMR", sub: "patient record · FHIR", x: L, y: 96, tone: "external" },
    { id: "pacs", label: "PACS", sub: "DICOM studies", x: L, y: 192, tone: "external" },
    {
      id: "imaging",
      label: "Imaging pipeline",
      sub: "ingest · de-identify",
      x: C,
      y: 192,
      detail:
        "Pulls studies, strips identifiers before inference and keeps a mapping only on the clinical side.",
    },
    {
      id: "inference",
      label: "Inference service",
      sub: "versioned · queued",
      x: C,
      y: 288,
      tone: "accent",
      detail:
        "Runs a pinned model version per request and records inputs, model version and output for audit.",
    },
    { id: "model", label: "AI model", sub: "registry · version pin", x: R, y: 288 },
    {
      id: "review",
      label: "Clinical workflow",
      sub: "radiologist decides",
      x: C,
      y: 384,
      tone: "accent",
    },
    {
      id: "audit",
      label: "Audit log",
      sub: "who · what · which model",
      x: R,
      y: 384,
      tone: "muted",
    },
    { id: "report", label: "Report", sub: "clinician-signed", x: C, y: 480 },
  ],
  edges: [
    { from: "clinician", to: "app", flow: true },
    { from: "emr", to: "app", dashed: true, label: "context" },
    { from: "pacs", to: "imaging", flow: true, label: "DICOM" },
    { from: "app", to: "imaging" },
    { from: "imaging", to: "inference", flow: true },
    { from: "model", to: "inference" },
    { from: "inference", to: "review", flow: true, label: "suggestion" },
    { from: "review", to: "audit" },
    { from: "review", to: "report", flow: true },
  ],
};

export const stakingSystem: Diagram = {
  id: "staking-system",
  title: "Staking protocol — contract architecture",
  caption:
    "Concept. Small contracts with one job each, audited primitives for access control, and events designed for the indexer from day one.",
  width: 720,
  height: 536,
  nodes: [
    { id: "wallet", label: "User wallet", sub: "EOA / smart account", x: C, y: 0, tone: "muted" },
    {
      id: "pool",
      label: "StakingPool",
      sub: "stake · withdraw · claim",
      x: C,
      y: 96,
      tone: "accent",
      detail:
        "Checks-effects-interactions ordering, reentrancy guard, and reward accounting per share rather than per loop.",
    },
    { id: "token", label: "Stake token", sub: "ERC-20", x: L, y: 192 },
    { id: "rewards", label: "RewardDistributor", sub: "reward per share", x: C, y: 192 },
    { id: "access", label: "AccessControl", sub: "roles · Pausable", x: R, y: 96, tone: "muted" },
    {
      id: "events",
      label: "Events",
      sub: "Staked · Withdrawn · …",
      x: C,
      y: 288,
      detail:
        "Indexed fields chosen for the queries the indexer will need, so no state must be read back from the chain.",
    },
    { id: "indexer", label: "Indexer", sub: "confirmations · reorgs", x: C, y: 384 },
    { id: "api", label: "Read API", sub: "positions · history", x: C, y: 480, tone: "muted" },
  ],
  edges: [
    { from: "wallet", to: "pool", flow: true },
    { from: "pool", to: "token", label: "transferFrom" },
    { from: "pool", to: "rewards", flow: true },
    { from: "access", to: "pool", dashed: true, label: "roles" },
    { from: "rewards", to: "events", flow: true },
    { from: "events", to: "indexer", flow: true },
    { from: "indexer", to: "api", flow: true },
  ],
};

export const agentSystem: Diagram = {
  id: "agent-system",
  title: "Engineering agent — control loop",
  caption:
    "Research direction. The loop is only as good as its feedback: tests and review are the signal, not the model's own confidence.",
  width: 720,
  height: 344,
  nodes: [
    { id: "repo", label: "Repository", sub: "code · history", x: L, y: 0, tone: "muted" },
    { id: "understand", label: "Code understanding", sub: "index · symbols", x: L, y: 96 },
    { id: "plan", label: "Planning agent", sub: "task → steps", x: L, y: 192, tone: "accent" },
    { id: "impl", label: "Implementation agent", sub: "edits · diffs", x: L, y: 288 },
    {
      id: "tests",
      label: "Test runner",
      sub: "sandboxed",
      x: R,
      y: 288,
      tone: "accent",
      detail:
        "Deterministic signal. Runs in an isolated sandbox with the repository's own test and lint commands.",
    },
    { id: "review", label: "Code review agent", sub: "diff critique", x: R, y: 192 },
    { id: "fix", label: "Fix agent", sub: "targeted patch", x: C, y: 224 },
    { id: "pr", label: "Pull request", sub: "human approval", x: R, y: 0, tone: "external" },
  ],
  edges: [
    { from: "repo", to: "understand", flow: true },
    { from: "understand", to: "plan", flow: true },
    { from: "plan", to: "impl", flow: true },
    { from: "impl", to: "tests", flow: true },
    { from: "tests", to: "review", flow: true, label: "pass" },
    { from: "tests", to: "fix", dashed: true, label: "fail" },
    { from: "review", to: "fix", dashed: true },
    { from: "fix", to: "impl", dashed: true, label: "patch" },
    { from: "review", to: "pr", flow: true },
  ],
};
