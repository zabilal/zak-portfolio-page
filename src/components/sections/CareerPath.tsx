"use client";

import Link from "next/link";
import { useState } from "react";
import { careerPath } from "@/content/philosophy";
import { TechList } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type ProjectRef = { slug: string; title: string };

/**
 * The through-line of the career as a path: a main trunk, then two branches.
 * Selecting a stage shows the tools and the case studies that belong to it.
 */
export function CareerPath({ projects }: { projects: ProjectRef[] }) {
  const [selected, setSelected] = useState(careerPath.find((s) => !s.branch)!.id);
  const stage = careerPath.find((s) => s.id === selected)!;
  const trunk = careerPath.filter((s) => !s.branch);
  const branches = careerPath.filter((s) => s.branch);
  const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

  const button = (s: (typeof careerPath)[number]) => (
    <button
      type="button"
      aria-pressed={s.id === selected}
      aria-controls="career-panel"
      onClick={() => setSelected(s.id)}
      className={cn(
        "w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        s.id === selected
          ? "border-accent bg-accent-soft text-fg"
          : "border-line bg-surface text-fg-2 hover:border-line-2 hover:text-fg",
      )}
    >
      {s.title}
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-10">
      <div>
        <ol aria-label="Career stages" className="space-y-0">
          {trunk.map((s, i) => (
            <li key={s.id} className="relative pb-3 pl-7">
              <span aria-hidden className="absolute top-0 bottom-0 left-2 w-px bg-line-2" />
              <span
                aria-hidden
                className={cn(
                  "absolute top-4 left-[4.5px] size-2 rounded-full",
                  s.id === selected ? "bg-accent" : "bg-line-2",
                )}
              />
              {i === trunk.length - 1 && (
                <span aria-hidden className="absolute top-4 left-2 h-full w-px bg-line-2" />
              )}
              {button(s)}
            </li>
          ))}
        </ol>
        <ol
          aria-label="Branches"
          className="relative ml-2 grid grid-cols-2 gap-3 border-t border-line-2 pt-4"
        >
          {branches.map((s) => (
            <li key={s.id} className="relative">
              <span aria-hidden className="absolute -top-4 left-1/2 h-4 w-px bg-line-2" />
              {button(s)}
            </li>
          ))}
        </ol>
      </div>

      <div
        id="career-panel"
        aria-live="polite"
        className="rounded-xl border border-line bg-surface p-6 sm:p-8"
      >
        <p className="eyebrow">
          {stage.branch
            ? "Branch"
            : `Stage ${trunk.findIndex((s) => s.id === stage.id) + 1} of ${trunk.length}`}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{stage.title}</h3>
        <p className="mt-3 text-lg leading-relaxed text-fg-2">{stage.body}</p>
        <div className="mt-6">
          <p className="mb-2 eyebrow">Tools of this stage</p>
          <TechList items={stage.technologies} />
        </div>
        {stage.projects.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 eyebrow">Related case studies</p>
            <ul className="space-y-1">
              {stage.projects.map((slug) => (
                <li key={slug}>
                  <Link href={`/projects/${slug}`} className="text-fg hover:text-accent">
                    {titleOf(slug)}{" "}
                    <span aria-hidden className="text-fg-3">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
