import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { statusLabels } from "@/content/projects";
import { glossary } from "@/content/skills";
import { isPending, type Maybe, type ProjectStatus } from "@/content/types";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}

export function SectionHeader({
  index,
  eyebrow,
  title,
  lead,
  id,
  as: Heading = "h2",
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <header className={cn("max-w-3xl", className)}>
      <p className="flex items-center gap-3 eyebrow">
        {index && <span className="text-accent">{index}</span>}
        <span>{eyebrow}</span>
      </p>
      <Heading
        id={id}
        className={cn(
          "mt-4 font-semibold tracking-[-0.025em] text-balance text-fg",
          Heading === "h1"
            ? "text-4xl leading-[1.08] sm:text-5xl"
            : "text-3xl leading-tight sm:text-4xl",
        )}
      >
        {title}
      </Heading>
      {lead && <div className="mt-5 text-lg leading-relaxed text-pretty text-fg-2">{lead}</div>}
    </header>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[0.72rem] text-fg-2",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A technology name that reveals what it is used for on hover or keyboard focus. */
export function TechChip({ name, className }: { name: string; className?: string }) {
  const detail = glossary[name];
  if (!detail) return <Tag className={className}>{name}</Tag>;
  return (
    <span
      tabIndex={0}
      className={cn(
        "group/chip relative inline-flex cursor-default items-center rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-[0.72rem] text-fg-2 transition-colors hover:border-accent/50 hover:text-fg focus-visible:border-accent/50 focus-visible:text-fg",
        className,
      )}
    >
      {name}
      <span className="sr-only">: {detail}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-max max-w-56 rounded-md border border-line-2 bg-surface-2 px-2.5 py-1.5 font-sans text-xs leading-snug text-fg-2 shadow-lg shadow-black/20 group-hover/chip:block group-focus-visible/chip:block"
      >
        {detail}
      </span>
    </span>
  );
}

export function TechList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Technologies">
      {items.map((t) => (
        <li key={t}>
          <TechChip name={t} />
        </li>
      ))}
    </ul>
  );
}

const statusTone: Record<ProjectStatus, string> = {
  reference: "text-accent border-accent/30 bg-accent-soft",
  prototype: "text-ok border-ok/30",
  building: "text-ok border-ok/30",
  research: "text-violet border-violet/30",
  concept: "text-warn border-warn/30",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      title={statusLabels[status].description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] tracking-wide uppercase",
        statusTone[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabels[status].label}
    </span>
  );
}

/** Renders a supplied value, or a clearly marked placeholder when the value has not been provided. */
export function Value({ value, className }: { value: Maybe<string>; className?: string }) {
  if (!isPending(value)) return <span className={className}>{value}</span>;
  return <Placeholder label={value.pending} className={className} />;
}

export function Placeholder({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-dashed border-line-2 px-1.5 py-px font-mono text-[0.7rem] text-fg-3",
        className,
      )}
    >
      [{label} — to be added]
    </span>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({
  variant = "secondary",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
        variant === "primary" && "bg-accent text-accent-ink hover:bg-accent/90",
        variant === "secondary" && "border border-line-2 bg-surface text-fg hover:border-fg-3",
        variant === "ghost" && "text-fg-2 hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function ArrowLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm font-medium text-accent",
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-xl border border-line bg-surface", className)} {...props} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[0.72rem] text-fg-3">{children}</span>;
}
