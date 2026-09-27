import Link from "next/link";
import { roles } from "@/content/experience";
import { exploring, principles } from "@/content/philosophy";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { languages, skillGroups, stackMatrix, tierLabels } from "@/content/skills";
import type { NoteMeta, ProficiencyTier } from "@/content/types";
import { isPending } from "@/content/types";
import { ButtonLink, Tag, TechChip, TechList, Value } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function PrinciplesGrid({ limit }: { limit?: number }) {
  const items = limit ? principles.slice(0, limit) : principles;
  return (
    <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {items.map((p, i) => (
        <li key={p.title} className="bg-surface p-5 sm:p-6">
          <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-3 font-semibold tracking-tight text-fg">{p.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function ExploringGrid() {
  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {exploring.map((e) => (
          <li key={e.title} className="rounded-xl border border-dashed border-line-2 p-5">
            <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-wide text-ok uppercase">
              <span aria-hidden className="pulse size-1.5 rounded-full bg-ok" />
              Active
            </p>
            <h3 className="mt-3 font-semibold text-fg">
              <Link href={`/engineering/${e.domain}`} className="hover:text-accent">
                {e.title}
              </Link>
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{e.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-[0.7rem] text-fg-3">
        Dashed border = current exploration, separate from completed professional work.
      </p>
    </div>
  );
}

const tierOrder: ProficiencyTier[] = ["production", "strong", "exploring"];

export function LanguageTiers() {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
      {tierOrder.map((tier, i) => (
        <section key={tier} aria-labelledby={`tier-${tier}`} className="bg-surface p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <span aria-hidden className="flex gap-0.5">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className={cn("h-3 w-1 rounded-sm", d < 3 - i ? "bg-accent" : "bg-line-2")}
                />
              ))}
            </span>
            <h3 id={`tier-${tier}`} className="font-mono text-xs tracking-wide text-fg uppercase">
              {tierLabels[tier].label}
            </h3>
          </div>
          <p className="mt-2 text-xs text-fg-3">{tierLabels[tier].description}</p>
          <ul className="mt-5 space-y-4">
            {languages
              .filter((l) => l.tier === tier)
              .map((l) => (
                <li key={l.name}>
                  <p className="text-lg font-semibold tracking-tight text-fg">{l.name}</p>
                  <p className="mt-0.5 text-sm text-fg-2">{l.context}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function SkillGroups() {
  return (
    <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
      {skillGroups.map((g) => (
        <div
          key={g.title}
          className="grid gap-3 px-5 py-4 sm:grid-cols-[11rem_1fr] sm:items-center sm:px-6"
        >
          <dt className="font-mono text-xs tracking-wide text-fg-3 uppercase">{g.title}</dt>
          <dd>
            <TechList items={g.items} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function StackMatrix() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Engineering stack by domain</caption>
        <thead className="hidden border-b border-line md:table-header-group">
          <tr className="font-mono text-[0.68rem] tracking-wide text-fg-3 uppercase">
            <th scope="col" className="px-6 py-3 font-normal">
              Domain
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              Technologies
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              Concepts
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              Case studies
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {stackMatrix.map((row) => (
            <tr
              key={row.domain}
              className="group grid gap-3 px-5 py-5 transition-colors hover:bg-surface-2 md:table-row md:p-0"
            >
              <th scope="row" className="font-semibold md:px-6 md:py-4 md:align-top">
                <Link
                  href={`/engineering/${row.domainId}`}
                  className="text-fg group-hover:text-accent"
                >
                  {row.domain}
                </Link>
              </th>
              <td className="md:px-3 md:py-4 md:align-top">
                <span className="sr-only md:hidden">Technologies: </span>
                <span className="flex flex-wrap gap-1.5">
                  {row.technologies.map((t) => (
                    <TechChip key={t} name={t} />
                  ))}
                </span>
              </td>
              <td className="text-fg-2 md:px-3 md:py-4 md:align-top">{row.concepts.join(" · ")}</td>
              <td className="md:px-6 md:py-4 md:align-top">
                {row.projects.length === 0 ? (
                  <span className="text-fg-3">—</span>
                ) : (
                  <ul className="space-y-0.5">
                    {row.projects.map((slug) => (
                      <li key={slug}>
                        <Link href={`/projects/${slug}`} className="text-fg-2 hover:text-accent">
                          {getProject(slug)?.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RoleList({ compact = false }: { compact?: boolean }) {
  return (
    <ol className="relative">
      {roles.map((role, i) => (
        <li
          key={role.company}
          className="relative grid gap-2 border-l border-line pb-8 pl-6 last:pb-0 sm:grid-cols-[14rem_1fr] sm:gap-8 sm:pl-8"
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 -left-[5px] size-[9px] rounded-full border",
              i === 0 ? "border-accent bg-accent" : "border-line-2 bg-bg",
            )}
          />
          <div>
            <p className="font-semibold text-fg">{role.company}</p>
            <p className="mt-0.5 font-mono text-[0.7rem] text-fg-3">{role.sector}</p>
          </div>
          <div>
            <p className="text-sm text-fg">
              <Value value={role.title} />
              {!compact && (
                <span className="ml-2 text-fg-3">
                  <Value value={role.period} />
                </span>
              )}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{role.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function NotesList({ notes }: { notes: NoteMeta[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {notes.map((note) => (
        <li key={note.slug}>
          {note.planned ? (
            <div className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div>
                <p className="text-fg-2">{note.title}</p>
                <p className="mt-0.5 text-sm text-fg-3">{note.summary}</p>
              </div>
              <span className="font-mono text-[0.68rem] text-fg-3">planned</span>
            </div>
          ) : (
            <Link
              href={`/writing/${note.slug}`}
              className="group grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:gap-6"
            >
              <div>
                <p className="font-medium text-fg group-hover:text-accent">{note.title}</p>
                <p className="mt-0.5 text-sm text-fg-2">{note.summary}</p>
              </div>
              <span className="flex items-center gap-2 font-mono text-[0.68rem] text-fg-3">
                {note.draft && <Tag className="text-warn">draft</Tag>}
                {note.readingMinutes} min
              </span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ContactBlock() {
  const { email } = site.contact;
  return (
    <section
      aria-labelledby="contact-cta"
      className="relative overflow-hidden rounded-2xl border border-line bg-surface"
    >
      <div
        aria-hidden
        className="absolute inset-0 grid-bg [mask-image:linear-gradient(to_left,black,transparent_70%)] opacity-60"
      />
      <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="eyebrow">Contact</p>
          <h2
            id="contact-cta"
            className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-balance sm:text-4xl"
          >
            Have a difficult system to build?
          </h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-fg-2">
            I&apos;m interested in ambitious engineering problems across fintech, distributed
            systems, AI and blockchain.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          {isPending(email) ? (
            <ButtonLink href="/contact" variant="primary">
              Get in touch
            </ButtonLink>
          ) : (
            <ButtonLink href={`mailto:${email}`} variant="primary">
              {email}
            </ButtonLink>
          )}
          <ButtonLink href="/resume">Resume</ButtonLink>
        </div>
      </div>
    </section>
  );
}
