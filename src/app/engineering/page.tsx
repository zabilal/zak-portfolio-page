import type { Metadata } from "next";
import Link from "next/link";
import { LanguageTiers, SkillGroups, StackMatrix } from "@/components/sections/sections";
import { Container, SectionHeader } from "@/components/ui/primitives";
import { domains } from "@/content/domains";

export const metadata: Metadata = {
  title: "Engineering",
  description:
    "Engineering domains: fintech, backend and distributed systems, data and messaging, AI engineering, blockchain, cloud infrastructure and frontend.",
  alternates: { canonical: "/engineering" },
};

export default function EngineeringPage() {
  return (
    <Container className="space-y-24 py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Engineering"
        title="Depth where it matters, range where it helps."
        lead="Backend and distributed systems in fintech are the core. Data, infrastructure and frontend are how that core gets built and shipped. Blockchain and AI are where it is going."
      />

      <section aria-labelledby="domains">
        <h2 id="domains" className="mb-6 eyebrow">
          Domains
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {domains.map((d, i) => (
            <li key={d.id} className="bg-surface">
              <Link
                href={`/engineering/${d.id}`}
                className="group flex h-full flex-col p-6 transition-colors hover:bg-surface-2"
              >
                <span className="font-mono text-xs text-fg-3">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>{" "}
                  /engineering/{d.id}
                </span>
                <span className="mt-4 text-lg font-semibold tracking-tight text-fg group-hover:text-accent">
                  {d.title}
                </span>
                <span className="mt-2 text-sm leading-relaxed text-fg-2">{d.tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="matrix-title">
        <SectionHeader
          id="matrix-title"
          eyebrow="Stack matrix"
          title="Domain × technology × concept."
        />
        <div className="mt-10">
          <StackMatrix />
        </div>
      </section>

      <section aria-labelledby="languages-title">
        <SectionHeader
          id="languages-title"
          eyebrow="Languages"
          title="Proficiency, described honestly."
          lead="No percentage bars. Each language is placed by the kind of experience behind it."
        />
        <div className="mt-10">
          <LanguageTiers />
        </div>
      </section>

      <section aria-labelledby="skills-title">
        <SectionHeader
          id="skills-title"
          eyebrow="Tools"
          title="Technology by category."
          lead="Hover or focus any technology to see what it is used for."
        />
        <div className="mt-10">
          <SkillGroups />
        </div>
      </section>
    </Container>
  );
}
