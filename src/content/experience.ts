import type { Role } from "./types";

/**
 * Professional experience, most recent first (order as supplied — verify).
 * Titles and dates that were not supplied are left pending rather than guessed.
 * Descriptions stay at the level of domain and engineering focus to respect confidentiality.
 */
export const roles: Role[] = [
  {
    company: "GlobalTrust Mortgage Bank",
    title: "Senior Backend Engineer",
    period: "January 2026 - Present",
    sector: "Banking",
    summary:
      "Backend engineering for a mortgage bank's financial infrastructure: core banking integration, customer accounts, ledgers and the workflows that move money between them.",
    focus: [
      "Core banking",
      "Financial infrastructure",
      "Ledger systems",
      "Banking workflows",
      "APIs",
      "Infrastructure",
    ],
    engineering: [
      "Designing backend services around customer accounts, transactions and financial state.",
      "Ledger-centred modelling so balances are derived from auditable postings.",
      "Integrating with core banking and external financial systems.",
      "Reconciliation between internal records and external statements.",
    ],
    relatedProjects: ["ledger"],
  },
  {
    company: "InsureOnGo",
    title: "Head of Engineering",
    period: "2025 - 2026",
    sector: "InsurTech",
    summary:
      "Engineering leadership and technical direction for an insurance technology product — from product design through deployment — alongside structuring and mentoring the technical team.",
    focus: [
      "InsurTech",
      "Backend engineering",
      "Product development",
      "Technical team structure",
      "Mentorship",
    ],
    engineering: [
      "Taking features from product design to production deployment.",
      "Shaping the technical team's structure and engineering practices.",
      "Mentoring engineers on backend design and delivery.",
    ],
  },
  {
    company: "Nomba",
    title: "Senior Backend Engineer",
    period: "2021 - 2023",
    sector: "Fintech · Payments",
    summary:
      "Engineering across business banking, personal banking, mobile money and agent networks — high-volume transaction systems operating in real African payment environments.",
    focus: [
      "Business banking",
      "Personal banking",
      "Mobile money",
      "Agent networks",
      "Payment infrastructure",
    ],
    engineering: [
      "Payment infrastructure for agent and merchant networks.",
      "High-volume transaction processing where networks and providers are unreliable.",
      "Transaction status management, retries and reconciliation.",
    ],
    relatedProjects: ["payment-system", "event-system"],
  },
  {
    company: "OmitsFx",
    title: "Senior Backend Engineer",
    period: "2025 - 2025",
    sector: "Cross-border payments",
    summary:
      "Cross-border payment and transaction processing: settlement, provider API integrations, and the concurrency and reliability work that keeps multi-currency transfers correct.",
    focus: [
      "Cross-border payments",
      "Transaction processing",
      "Settlement",
      "API integrations",
      "Concurrency",
      "Reliability",
    ],
    engineering: [
      "Transaction processing and settlement flows for cross-border transfers.",
      "Integrations with external payment and FX providers.",
      "Concurrency control and scalability in the transaction path.",
    ],
    relatedProjects: ["payment-system"],
  },
  {
    company: "fonYou",
    title: "Senior Backend Engineer",
    period: "2023 - 2024",
    sector: "Digital banking and Telecommunications",
    summary: "Digital banking and Lending applications with Spring Boot backends and Telecom infrastructure",
    focus: ["Digital banking", "Lending", "Backend architecture", "Financial applications", "Telecom infrastructure"],
    engineering: [
      "Spring Boot services for digital banking and lending products.",
      "Telecom infrastructure and solutions.",
    ],
    technologies: ["Spring Boot", "Telecom infrastructure"],
  },
];
