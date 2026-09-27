import type { Metadata } from "next";
import Link from "next/link";
import { CareerPath } from "@/components/sections/CareerPath";
import { Container, SectionHeader, TechList, Value } from "@/components/ui/primitives";
import { roles } from "@/content/experience";
import { getProject, projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience across banking, insurtech, payments, mobile money, cross-border transfers and digital banking: GlobalTrust Mortgage Bank, InsureOnGo, Nomba, OmitsFx and fonYou.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <Container className="space-y-24 py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Experience"
        title="Where the systems came from."
        lead="Described at the level of domain and engineering focus. Employer systems, data and business logic stay confidential."
      />

      <section aria-labelledby="roles" className="space-y-4">
        <h2 id="roles" className="sr-only">
          Roles
        </h2>
        {roles.map((role, i) => (
          <article
            key={role.company}
            className="grid gap-6 rounded-xl border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[16rem_1fr] lg:gap-10"
          >
            <header>
              <p className="font-mono text-xs text-fg-3">
                <span className={i === 0 ? "text-accent" : undefined}>
                  {String(roles.length - i).padStart(2, "0")}
                </span>{" "}
                · {role.sector}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{role.company}</h3>
              <p className="mt-1 text-sm text-fg">
                <Value value={role.title} />
              </p>
              <p className="mt-1 text-sm text-fg-3">
                <Value value={role.period} />
              </p>
            </header>
            <div>
              <p className="leading-relaxed text-fg-2">{role.summary}</p>
              <ul className="mt-5 space-y-2">
                {role.engineering.map((e) => (
                  <li key={e} className="relative pl-5 text-sm leading-relaxed text-fg-2">
                    <span
                      aria-hidden
                      className="absolute top-[0.65em] left-0 h-px w-2.5 bg-accent"
                    />
                    {e}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-5">
                <div>
                  <p className="mb-2 eyebrow">Focus</p>
                  <p className="text-sm text-fg-2">{role.focus.join(" · ")}</p>
                </div>
                {role.technologies && (
                  <div>
                    <p className="mb-2 eyebrow">Stack</p>
                    <TechList items={role.technologies} />
                  </div>
                )}
                {role.relatedProjects && (
                  <div>
                    <p className="mb-2 eyebrow">Related reference architecture</p>
                    <ul className="text-sm">
                      {role.relatedProjects.map((slug) => (
                        <li key={slug}>
                          <Link href={`/projects/${slug}`} className="text-fg hover:text-accent">
                            {getProject(slug)?.title} →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="path-title">
        <SectionHeader
          id="path-title"
          eyebrow="Engineering timeline"
          title="Increasingly complex problems, increasingly powerful tools."
          lead="Select a stage to see the tools and case studies that belong to it."
        />
        <div className="mt-10">
          <CareerPath projects={projects.map((p) => ({ slug: p.slug, title: p.title }))} />
        </div>
      </section>
    </Container>
  );
}
