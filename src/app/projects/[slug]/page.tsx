import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemDiagram } from "@/components/diagram/SystemDiagram";
import { demoMeta, demos } from "@/components/lab/demos";
import { ArrowLink, Container, StatusBadge, TechList } from "@/components/ui/primitives";
import { domainTitle } from "@/content/domains";
import { caseStudyOrder, getProject, OUTCOME_PENDING, projects } from "@/content/projects";
import type { CaseStudySection } from "@/content/types";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

export default async function ProjectPage({ params }: Props) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const Demo = project.demo ? demos[project.demo] : null;
  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length]!;
  const sections = caseStudyOrder.map((key) => ({ key, section: project[key] }));

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg fade-mask" />
        <Container className="relative py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-fg-3">
            <Link href="/projects" className="hover:text-fg">
              work
            </Link>
            <span aria-hidden className="px-2">
              /
            </span>
            <span className="text-fg-2">{project.slug}</span>
          </nav>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-accent">{project.index}</span>
            <span className="font-mono text-xs text-fg-3">{project.category.join(" / ")}</span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.03em] sm:text-6xl">
            {project.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-fg-2 sm:text-xl">
            {project.summary}
          </p>
          <p className="mt-6 max-w-2xl rounded-lg border border-dashed border-line-2 px-4 py-3 text-sm leading-relaxed text-fg-2">
            <span className="font-mono text-[0.68rem] tracking-wide text-fg-3 uppercase">
              Disclosure ·{" "}
            </span>
            {project.disclosure}
          </p>
          <dl className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
            <div>
              <dt className="mb-2 eyebrow">Technologies</dt>
              <dd>
                <TechList items={project.technologies} />
              </dd>
            </div>
            <div>
              <dt className="mb-2 eyebrow">Concepts</dt>
              <dd className="text-sm leading-relaxed text-fg-2">{project.concepts.join(" · ")}</dd>
            </div>
            <div>
              <dt className="mb-2 eyebrow">Domains</dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {project.domains.map((d) => (
                  <Link key={d} href={`/engineering/${d}`} className="text-fg-2 hover:text-accent">
                    {domainTitle(d)}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>
        </Container>
      </header>

      <Container className="grid gap-12 py-14 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16 lg:py-20">
        <nav aria-label="Case study sections" className="hidden lg:block">
          <ol className="sticky top-24 space-y-1 border-l border-line font-mono text-xs">
            {sections.map(({ key, section }, i) => (
              <li key={key}>
                <a
                  href={`#${key}`}
                  className="-ml-px block border-l border-transparent py-1 pl-4 text-fg-3 hover:border-accent hover:text-fg"
                >
                  {String(i + 1).padStart(2, "0")} {section.heading}
                </a>
              </li>
            ))}
            {Demo && (
              <li>
                <a
                  href="#demo"
                  className="-ml-px block border-l border-transparent py-1 pl-4 text-accent hover:border-accent"
                >
                  ▸ Interactive
                </a>
              </li>
            )}
          </ol>
        </nav>

        <div className="max-w-3xl min-w-0 space-y-16">
          {sections.map(({ key, section }, i) => (
            <div key={key} className="space-y-8">
              <Section id={key} n={i + 1} section={section} />
              {key === "architecture" && <SystemDiagram diagram={project.diagram} />}
            </div>
          ))}

          {Demo && project.demo && (
            <section id="demo" aria-labelledby="demo-title" className="scroll-mt-24">
              <p className="eyebrow">Interactive</p>
              <h2 id="demo-title" className="mt-3 text-2xl font-semibold tracking-tight">
                {demoMeta[project.demo].title}
              </h2>
              <p className="mt-3 leading-relaxed text-fg-2">{demoMeta[project.demo].description}</p>
              <div className="mt-6">
                <Demo />
              </div>
            </section>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
            <ArrowLink href="/projects">All case studies</ArrowLink>
            <Link href={`/projects/${next.slug}`} className="group text-right">
              <span className="block font-mono text-[0.68rem] text-fg-3">next · {next.index}</span>
              <span className="text-fg group-hover:text-accent">{next.title} →</span>
            </Link>
          </footer>
        </div>
      </Container>
    </article>
  );
}

function Section({ id, n, section }: { id: string; n: number; section: CaseStudySection }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <p className="font-mono text-xs text-accent">{String(n).padStart(2, "0")}</p>
      <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight">
        {section.heading}
      </h2>
      <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed text-fg-2">
        {section.body.map((p) =>
          p === OUTCOME_PENDING ? (
            <p
              key={p}
              className="rounded-md border border-dashed border-line-2 px-3 py-2 font-mono text-xs text-fg-3"
            >
              [{p}]
            </p>
          ) : (
            <p key={p}>{p}</p>
          ),
        )}
      </div>
      {section.bullets && (
        <ul className="mt-5 space-y-2.5">
          {section.bullets.map((b) => (
            <li key={b} className="relative pl-5 leading-relaxed text-fg-2">
              <span aria-hidden className="absolute top-[0.7em] left-0 h-px w-2.5 bg-accent" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
