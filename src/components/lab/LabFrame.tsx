import type { ReactNode } from "react";

/** Shared chrome for Lab simulations: a titled panel that says plainly it is a simulation. */
export function LabFrame({
  title,
  subtitle,
  onReset,
  children,
}: {
  title: string;
  subtitle: string;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="min-w-0 rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="flex items-baseline gap-3">
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
          <span className="hidden font-mono text-[0.68rem] text-fg-3 sm:inline">{subtitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded border border-line px-1.5 py-px font-mono text-[0.62rem] tracking-wide text-fg-3 uppercase">
            In-browser simulation
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="font-mono text-[0.7rem] text-fg-3 hover:text-fg"
            >
              reset
            </button>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
