import type { Metadata } from "next";
import { PrintButton } from "@/components/sections/PrintButton";
import { Container, Value } from "@/components/ui/primitives";
import { roles } from "@/content/experience";
import { projects, statusLabels } from "@/content/projects";
import { site } from "@/content/site";
import { languages, skillGroups, tierLabels } from "@/content/skills";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume of ${site.name}, ${site.role} — backend and distributed systems, fintech, blockchain and AI engineering.`,
  alternates: { canonical: "/resume" },
};

/**
 * The resume is rendered from the same structured content as the rest of the site, so it
 * can never drift from it. The PDF is a print of this page (see scripts/resume-pdf.mjs).
 */
export default function ResumePage() {
  const contact = [site.contact.email, site.contact.linkedin, site.contact.github];

  return (
    <Container className="py-12 sm:py-16 print:max-w-none print:p-0">
      <div className="no-print mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-fg-3">Generated from the site&apos;s content model.</p>
        <div className="flex gap-2">
          <a
            href={site.resumePdf}
            download
            className="inline-flex h-9 items-center rounded-md bg-accent px-3 text-sm font-medium text-accent-ink"
          >
            Download PDF
          </a>
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-3xl rounded-xl border border-line bg-surface p-6 sm:p-10 print:rounded-none print:border-0 print:p-0">
        <header className="border-b border-line pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-lg text-fg">
            {site.role} · {site.disciplines.join(" · ")}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-fg-2">
            <span>{site.location}</span>
            <span>{site.url.replace("https://", "")}</span>
            {contact.map((c, i) => (
              <Value key={i} value={c} />
            ))}
          </p>
        </header>

        <Block title="Profile">
          <p className="leading-relaxed text-fg-2">
            {site.intro} I build transaction systems where correctness, idempotency and failure
            recovery matter more than simply making an API respond quickly.
          </p>
        </Block>

        <Block title="Experience">
          <ol className="space-y-5">
            {roles.map((r) => (
              <li key={r.company} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-semibold text-fg">
                    {r.company} <span className="font-normal text-fg-3">· {r.sector}</span>
                  </h3>
                  <span className="text-sm text-fg-3">
                    <Value value={r.period} />
                  </span>
                </div>
                <p className="text-sm text-fg">
                  <Value value={r.title} />
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-sm leading-relaxed text-fg-2 marker:text-fg-3">
                  {r.engineering.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Block>

        <Block title="Languages">
          <ul className="grid gap-1 text-sm sm:grid-cols-3">
            {(["production", "strong", "exploring"] as const).map((tier) => (
              <li key={tier}>
                <span className="text-fg-3">{tierLabels[tier].label}: </span>
                <span className="text-fg">
                  {languages
                    .filter((l) => l.tier === tier)
                    .map((l) => l.name)
                    .join(", ")}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Skills">
          <dl className="grid gap-1.5 text-sm">
            {skillGroups
              .filter((g) => g.title !== "Languages")
              .map((g) => (
                <div key={g.title} className="grid grid-cols-[9.5rem_1fr] gap-3">
                  <dt className="text-fg-3">{g.title}</dt>
                  <dd className="text-fg-2">{g.items.join(", ")}</dd>
                </div>
              ))}
          </dl>
        </Block>

        <Block title="Selected engineering work">
          <ul className="space-y-2 text-sm">
            {projects.map((p) => (
              <li key={p.slug} className="break-inside-avoid">
                <span className="font-medium text-fg">{p.title}</span>
                <span className="text-fg-3"> · {statusLabels[p.status].label}</span>
                <p className="leading-relaxed text-fg-2">{p.summary}</p>
              </li>
            ))}
          </ul>
        </Block>
      </article>
    </Container>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-5 last:border-0 last:pb-0">
      <h2 className="mb-3 font-mono text-[0.7rem] tracking-[0.14em] text-accent uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
