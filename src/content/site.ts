import type { Maybe } from "./types";

/**
 * Single source of truth for identity and contact details.
 * Values wrapped in `{ pending }` render as clearly marked placeholders until supplied.
 */
export const site = {
  name: "Zakariya Raji",
  shortName: "Z. Raji",
  url: "https://zakariyaraji.dev",
  role: "Senior Software Engineer",
  disciplines: ["Distributed Systems", "Fintech", "AI", "Blockchain"],
  headline:
    "Building financial infrastructure, distributed systems, AI systems and blockchain applications.",
  intro:
    "I design and build production software across fintech, backend infrastructure, distributed systems, AI/ML and blockchain — from financial ledgers and payment systems to intelligent applications and smart contracts.",
  principle: "Build systems that are correct, observable, resilient and understandable.",
  description:
    "Zakariya Raji is a senior software engineer working on financial infrastructure, payments, ledgers and distributed backend systems in Java, Go and TypeScript, with active work in blockchain (Solidity, EVM) and AI engineering.",
  location: "Nigeria",
  contact: {
    // email: { pending: "zakariyyaraji@gmail.com" } as Maybe<string>,
    email: "zakariyyaraji@gmail.com",
    // github: { pending: "zabilal" } as Maybe<string>,
    github: "zabilal",
    // linkedin: { pending: "LinkedIn profile URL" } as Maybe<string>,
    linkedin: "https://linkedin.com/in/zakariya-raji",
    // x: { pending: "X / Twitter handle (optional)" } as Maybe<string>,
    x: "",
  },
  /** Years of experience are only displayed once confirmed. */
  experienceYears: "14",
  resumePdf: "/zakariya-raji-resume.pdf",
} as const;

export type NavItem = { href: string; label: string };

export const primaryNav: NavItem[] = [
  { href: "/projects", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/lab", label: "Lab" },
  { href: "/writing", label: "Writing" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
];

export const secondaryNav: NavItem[] = [
  { href: "/open-source", label: "Open source" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];
