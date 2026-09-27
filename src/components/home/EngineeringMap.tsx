"use client";

import Link from "next/link";
import { useState } from "react";
import { mapNodes, type MapNode } from "@/content/map";
import { TechList } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

type ProjectRef = { slug: string; title: string };

const cell = (n: MapNode) => ({ x: n.col * 100 + 50, y: n.row * 100 + 50 });

/** Every related pair once, for the background mesh. */
const links = mapNodes.flatMap((a) =>
  a.related
    .filter((id) => a.id < id)
    .map((id) => ({ a, b: mapNodes.find((n) => n.id === id)! }))
    .filter((l) => l.b),
);

export function EngineeringMap({ projects }: { projects: ProjectRef[] }) {
  const [selected, setSelected] = useState<string>("distributed");
  const node = mapNodes.find((n) => n.id === selected)!;
  const isRelated = (id: string) => node.related.includes(id);
  const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? slug;

  function onKeyDown(e: React.KeyboardEvent, n: MapNode) {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
      ArrowDown: [0, 1],
      ArrowUp: [0, -1],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    const target = mapNodes.find((m) => m.col === n.col + move[0] && m.row === n.row + move[1]);
    if (target) {
      setSelected(target.id);
      document.getElementById(`map-${target.id}`)?.focus();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
      <div className="relative aspect-square w-full rounded-xl border border-line bg-surface p-2 sm:p-3">
        <svg
          viewBox="0 0 300 300"
          preserveAspectRatio="none"
          className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] sm:inset-3 sm:h-[calc(100%-1.5rem)] sm:w-[calc(100%-1.5rem)]"
          aria-hidden
        >
          {links.map(({ a, b }) => {
            const hot = a.id === selected || b.id === selected;
            const p = cell(a);
            const q = cell(b);
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={hot ? "var(--accent)" : "var(--line-2)"}
                strokeOpacity={hot ? 0.9 : 0.6}
                strokeWidth={hot ? 1.5 : 1}
                strokeDasharray={hot ? undefined : "3 4"}
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke 150ms" }}
              />
            );
          })}
        </svg>
        <div
          role="group"
          aria-label="Engineering areas"
          className="relative grid h-full grid-cols-3 grid-rows-3 gap-2 sm:gap-3"
        >
          {mapNodes.map((n) => {
            const active = n.id === selected;
            const related = isRelated(n.id);
            return (
              <div key={n.id} className="flex items-center justify-center p-1 sm:p-3">
                <button
                  id={`map-${n.id}`}
                  type="button"
                  aria-pressed={active}
                  aria-controls="map-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setSelected(n.id)}
                  onKeyDown={(e) => onKeyDown(e, n)}
                  className={cn(
                    "relative w-full rounded-lg border px-1.5 py-3 text-center text-[0.72rem] leading-tight font-medium transition-all sm:px-3 sm:text-sm",
                    active
                      ? "border-accent bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))] text-fg shadow-[0_0_0_4px_var(--accent-soft)]"
                      : related
                        ? "border-accent/40 bg-surface text-fg"
                        : "border-line bg-bg-2 text-fg-3 hover:border-line-2 hover:text-fg",
                  )}
                >
                  {n.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div
        id="map-panel"
        aria-live="polite"
        className="flex flex-col rounded-xl border border-line bg-surface p-5 sm:p-7"
      >
        <p className="eyebrow">
          node <span className="text-accent">{node.id}</span> · {node.related.length} connections
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{node.label}</h3>
        <p className="mt-3 leading-relaxed text-fg-2">{node.summary}</p>

        <dl className="mt-6 grid gap-5 text-sm">
          <div>
            <dt className="mb-2 eyebrow">Technologies</dt>
            <dd>
              <TechList items={node.technologies} />
            </dd>
          </div>
          <div>
            <dt className="mb-2 eyebrow">Concepts</dt>
            <dd className="text-fg-2">{node.concepts.join(" · ")}</dd>
          </div>
          {node.projects.length > 0 && (
            <div>
              <dt className="mb-2 eyebrow">Case studies</dt>
              <dd>
                <ul className="space-y-1">
                  {node.projects.map((slug) => (
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
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-auto pt-6">
          <Link
            href={node.href}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            Go deeper into {node.label.toLowerCase()} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
