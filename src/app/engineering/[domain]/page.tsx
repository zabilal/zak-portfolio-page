import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemDiagram } from "@/components/diagram/SystemDiagram";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { NotesList } from "@/components/sections/sections";
import { Container, TechList } from "@/components/ui/primitives";
import { domains, getDomain } from "@/content/domains";
import { getNote } from "@/content/notes";
import { getProject } from "@/content/projects";
import type { NoteMeta, Project } from "@/content/types";

type Props = { params: Promise<{ domain: string }> };

export function generateStaticParams() {
  return domains.map((d) => ({ domain: d.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = getDomain((await params).domain);
  if (!domain) return {};
  return {
    title: domain.title,
    description: domain.tagline,
    alternates: { canonical: `/engineering/${domain.id}` },
  };
}

export default async function DomainPage({ params }: Props) {
  const domain = getDomain((await params).domain);
  if (!domain) notFound();

  const related = domain.projects.map(getProject).filter((p): p is Project => Boolean(p));
  const notes = domain.notes.map(getNote).filter((n): n is NoteMeta => Boolean(n));
  const others = domains.filter((d) => d.id !== domain.id);

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg fade-mask" />
        <Container className="relative py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-fg-3">
            <Link href="/engineering" className="hover:text-fg">
              engineering
            </Link>
            <span aria-hidden className="px-2">
              /
            </span>
            <span className="text-fg-2">{domain.id}</span>
          </nav>
          <h1 className="mt-8 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">
            {domain.title}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-snug text-balance text-fg">
            {domain.tagline}
          </p>
          <div className="mt-6 max-w-2xl space-y-4 leading-relaxed text-fg-2">
            {domain.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Container>
      </header>

      <Container className="space-y-20 py-16 sm:py-20">
        <section aria-labelledby="capabilities">
          <h2 id="capabilities" className="mb-6 eyebrow">
            Capabilities
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {domain.capabilities.map((c) => (
              <section
                key={c.id}
                id={c.id}
                aria-labelledby={`${c.id}-title`}
                className="scroll-mt-24 rounded-xl border border-line bg-surface p-6"
              >
                <h3 id={`${c.id}-title`} className="text-lg font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-2">{c.description}</p>
                <ul className="mt-5 space-y-1.5 border-t border-line pt-4">
                  {c.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-fg-2">
                      <span aria-hidden className="mt-[0.6em] h-px w-2 shrink-0 bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        {domain.diagrams.length > 0 && (
          <section aria-labelledby="architecture" className="space-y-6">
            <h2 id="architecture" className="eyebrow">
              Architecture
            </h2>
            {domain.diagrams.map((d) => (
              <SystemDiagram key={d.id} diagram={d} />
            ))}
          </section>
        )}

        <section aria-labelledby="stack" className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 id="stack" className="mb-4 eyebrow">
              Technologies
            </h2>
            <TechList items={domain.technologies} />
          </div>
          <div>
            <h2 className="mb-4 eyebrow">Concepts</h2>
            <p className="leading-relaxed text-fg-2">{domain.concepts.join(" · ")}</p>
          </div>
        </section>

        {related.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related" className="mb-6 eyebrow">
              Case studies
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </section>
        )}

        {notes.length > 0 && (
          <section aria-labelledby="notes">
            <h2 id="notes" className="mb-6 eyebrow">
              Engineering notes
            </h2>
            <NotesList notes={notes} />
          </section>
        )}

        <nav aria-label="Other domains" className="border-t border-line pt-8">
          <p className="mb-4 eyebrow">Other domains</p>
          <ul className="flex flex-wrap gap-2">
            {others.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/engineering/${d.id}`}
                  className="inline-flex rounded-md border border-line px-3 py-1.5 text-sm text-fg-2 hover:border-line-2 hover:text-fg"
                >
                  {d.short}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
