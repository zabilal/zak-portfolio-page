import Link from "next/link";
import type { Project } from "@/content/types";
import { StatusBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

/** Compact "signature" of a system: its diagram's main path, derived from data. */
function signature(project: Project): string {
  const main = project.diagram.edges.filter((e) => e.flow && !e.dashed);
  const byId = new Map(project.diagram.nodes.map((n) => [n.id, n.label]));
  const path: string[] = [];
  let current = main[0]?.from;
  const seen = new Set<string>();
  while (current && !seen.has(current) && path.length < 5) {
    seen.add(current);
    path.push(byId.get(current) ?? current);
    current = main.find((e) => e.from === current)?.to;
  }
  return path.join("  →  ");
}

export function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-2 sm:p-6",
        large && "lg:p-8",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-fg-3">
          <span className="text-accent">{project.index}</span> · {project.category.join(" / ")}
        </span>
        <StatusBadge status={project.status} />
      </div>
      <h3
        className={cn("mt-5 font-semibold tracking-tight text-fg", large ? "text-2xl" : "text-xl")}
      >
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0 after:rounded-xl"
        >
          {project.title}
        </Link>
      </h3>
      <p className="mt-3 leading-relaxed text-pretty text-fg-2">{project.summary}</p>
      <p
        aria-hidden
        className="mt-5 truncate border-t border-line pt-4 font-mono text-[0.68rem] text-fg-3"
      >
        {signature(project)}
      </p>
      <p className="mt-3 flex items-center justify-between gap-3 text-xs text-fg-3">
        <span>{project.concepts.slice(0, 4).join(" · ")}</span>
        <span aria-hidden className="text-accent transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </p>
    </article>
  );
}
