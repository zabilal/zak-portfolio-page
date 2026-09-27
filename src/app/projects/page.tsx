import type { Metadata } from "next";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { Container, SectionHeader, StatusBadge } from "@/components/ui/primitives";
import { projects, statusLabels } from "@/content/projects";
import type { ProjectStatus } from "@/content/types";

export const metadata: Metadata = {
  title: "Case studies",
  description:
    "Engineering case studies: a double-entry ledger, a payment processing platform, a Kafka event system, an AI radiology concept, a staking protocol and an AI engineering agent.",
  alternates: { canonical: "/projects" },
};

const statuses = [...new Set(projects.map((p) => p.status))] as ProjectStatus[];

export default function ProjectsPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Work"
        title="Engineering case studies"
        lead="Written like an engineering journal: the problem, the constraints, the design, the decisions that could have gone the other way, and what I learned."
      />

      <section
        aria-labelledby="labels"
        className="mt-12 rounded-xl border border-line bg-surface p-5 sm:p-6"
      >
        <h2 id="labels" className="eyebrow">
          How to read the labels
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {statuses.map((s) => (
            <div key={s}>
              <dt>
                <StatusBadge status={s} />
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-fg-2">
                {statusLabels[s].description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} large />
        ))}
      </div>
    </Container>
  );
}
