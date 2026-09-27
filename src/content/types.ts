/**
 * Content model. Everything the site renders is described by these types, so
 * adding a project, article, domain or technology is a data change, not a UI change.
 */

/** A value that has not been supplied yet. Rendered as a visible placeholder, never invented. */
export type Pending = { pending: string };
export type Maybe<T> = T | Pending;

export function isPending<T>(value: Maybe<T>): value is Pending {
  return typeof value === "object" && value !== null && "pending" in value;
}

export type DomainId =
  "fintech" | "distributed-systems" | "data" | "ai" | "blockchain" | "cloud" | "frontend";

/**
 * Honest labelling of a piece of work. The site never presents an idea as a production system.
 * - reference: an architecture generalised from professional work; employer details omitted.
 * - prototype / building: code exists or is being written.
 * - concept / research: design or investigation stage.
 */
export type ProjectStatus = "reference" | "prototype" | "building" | "research" | "concept";

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  /** Top-left position in diagram units. */
  x: number;
  y: number;
  w?: number;
  tone?: "default" | "accent" | "muted" | "external";
  /** Shown when the node is hovered or focused. */
  detail?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  /** Animate a packet travelling along this edge. */
  flow?: boolean;
};

export type Diagram = {
  id: string;
  title: string;
  caption?: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

export type CaseStudySection = {
  heading: string;
  body: string[];
  bullets?: string[];
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string[];
  domains: DomainId[];
  summary: string;
  status: ProjectStatus;
  /** Plain statement of what this page is and is not. */
  disclosure: string;
  technologies: string[];
  concepts: string[];
  featured?: boolean;
  diagram: Diagram;
  /** Interactive demo embedded in the case study, keyed to a component in the lab. */
  demo?: LabDemoId;
  problem: CaseStudySection;
  context: CaseStudySection;
  architecture: CaseStudySection;
  decisions: CaseStudySection;
  tradeoffs: CaseStudySection;
  implementation: CaseStudySection;
  challenges: CaseStudySection;
  outcome: CaseStudySection;
  learned: CaseStudySection;
};

export type LabDemoId = "ledger" | "payment" | "kafka" | "chain" | "ai-pipeline";

export type Capability = {
  id: string;
  title: string;
  description: string;
  items: string[];
};

export type Domain = {
  id: DomainId;
  title: string;
  short: string;
  tagline: string;
  intro: string[];
  capabilities: Capability[];
  technologies: string[];
  concepts: string[];
  diagrams: Diagram[];
  projects: string[];
  notes: string[];
};

export type ProficiencyTier = "production" | "strong" | "exploring";

export type Language = {
  name: string;
  tier: ProficiencyTier;
  context: string;
};

export type Role = {
  company: string;
  title: Maybe<string>;
  period: Maybe<string>;
  sector: string;
  summary: string;
  focus: string[];
  engineering: string[];
  /** Only technologies confirmed for this role. */
  technologies?: string[];
  relatedProjects?: string[];
};

export type NoteMeta = {
  slug: string;
  title: string;
  summary: string;
  domains: DomainId[];
  /** ISO date. Only set for written notes. */
  date?: string;
  readingMinutes?: number;
  /** Written but not yet reviewed by the author. Shown with a Draft label. */
  draft?: boolean;
  /** Listed as planned; no page exists yet. */
  planned?: boolean;
};
