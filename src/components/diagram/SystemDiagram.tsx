"use client";

import { useState } from "react";
import type { Diagram, DiagramNode } from "@/content/types";
import { cn } from "@/lib/cn";
import { edgePath, NODE_H, NODE_W, orderedNodes } from "./geometry";

/**
 * Architecture diagram. Desktop: an SVG where hovering a node lights up its connections and
 * explains its role. Mobile and assistive tech: the same system as an ordered list of steps,
 * because a scaled-down wide diagram is unreadable on a phone.
 */
export function SystemDiagram({ diagram, className }: { diagram: Diagram; className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));
  const activeNode = active ? byId.get(active) : undefined;
  const inspectable = diagram.nodes.filter((n) => n.detail);
  const connected = (edge: { from: string; to: string }) =>
    active !== null && (edge.from === active || edge.to === active);

  return (
    <figure className={cn("rounded-xl border border-line bg-surface", className)}>
      <figcaption className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <span className="font-mono text-xs text-fg-2">{diagram.title}</span>
        <span aria-hidden className="hidden font-mono text-[0.65rem] text-fg-3 md:inline">
          hover a component
        </span>
      </figcaption>

      <div className="hidden p-5 md:block">
        <svg
          viewBox={`-4 -4 ${diagram.width + 8} ${diagram.height + 8}`}
          className="mx-auto h-auto w-full max-w-3xl"
          aria-hidden
          onMouseLeave={() => setActive(null)}
        >
          <defs>
            <marker
              id={`${diagram.id}-arrow`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M1,1 L7,4 L1,7" fill="none" stroke="var(--line-2)" strokeWidth="1.3" />
            </marker>
            <marker
              id={`${diagram.id}-arrow-hot`}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M1,1 L7,4 L1,7" fill="none" stroke="var(--accent)" strokeWidth="1.3" />
            </marker>
          </defs>

          {diagram.edges.map((edge, i) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            const { d } = edgePath(a, b);
            const hot = connected(edge);
            const dim = active !== null && !hot;
            return (
              <g
                key={`${edge.from}-${edge.to}`}
                style={{ opacity: dim ? 0.3 : 1, transition: "opacity 150ms" }}
              >
                <path
                  d={d}
                  fill="none"
                  stroke={hot ? "var(--accent)" : "var(--line-2)"}
                  strokeWidth={1.25}
                  strokeDasharray={edge.dashed ? "4 4" : undefined}
                  markerEnd={`url(#${diagram.id}-arrow${hot ? "-hot" : ""})`}
                />
                {edge.flow && (
                  <path
                    d={d}
                    pathLength={100}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={2.25}
                    strokeLinecap="round"
                    className="flow-packet"
                    style={{ ["--flow-delay" as string]: `${(i * 0.45) % 3}s` }}
                  />
                )}
              </g>
            );
          })}

          {diagram.edges.map((edge) => {
            if (!edge.label) return null;
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            const { mid } = edgePath(a, b);
            const w = edge.label.length * 6.2 + 10;
            return (
              <g
                key={`label-${edge.from}-${edge.to}`}
                style={{ opacity: active && !connected(edge) ? 0.3 : 1 }}
              >
                <rect
                  x={mid.x - w / 2}
                  y={mid.y - 8}
                  width={w}
                  height={16}
                  rx={3}
                  fill="var(--surface)"
                />
                <text
                  x={mid.x}
                  y={mid.y + 3.5}
                  textAnchor="middle"
                  className="fill-fg-3 font-mono"
                  fontSize={10}
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {diagram.nodes.map((node) => (
            <NodeShape
              key={node.id}
              node={node}
              active={active === node.id}
              dim={
                active !== null &&
                active !== node.id &&
                !diagram.edges.some((e) => connected(e) && (e.from === node.id || e.to === node.id))
              }
              onEnter={() => setActive(node.id)}
            />
          ))}
        </svg>

        <div className="mt-4 grid gap-3 border-t border-line pt-4 md:grid-cols-[1fr_auto]">
          <p aria-live="polite" className="min-h-[2.75rem] text-sm leading-relaxed text-fg-2">
            {activeNode ? (
              <>
                <span className="font-medium text-fg">{activeNode.label}. </span>
                {activeNode.detail ?? activeNode.sub}
              </>
            ) : (
              diagram.caption
            )}
          </p>
          {inspectable.length > 0 && (
            <div className="flex flex-wrap items-start gap-1.5 md:max-w-xs md:justify-end">
              {inspectable.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={active === n.id}
                  onClick={() => setActive(active === n.id ? null : n.id)}
                  onFocus={() => setActive(n.id)}
                  className={cn(
                    "rounded border px-2 py-0.5 font-mono text-[0.68rem] transition-colors",
                    active === n.id
                      ? "border-accent/60 text-accent"
                      : "border-line text-fg-3 hover:text-fg",
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile + screen readers: the system as a sequence. */}
      <div className="p-4 md:sr-only">
        {diagram.caption && (
          <p className="mb-4 text-sm leading-relaxed text-fg-2">{diagram.caption}</p>
        )}
        <ol className="relative space-y-2 border-l border-line pl-5">
          {orderedNodes(diagram).map((node) => {
            const outgoing = diagram.edges.filter((e) => e.from === node.id);
            return (
              <li key={node.id} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-3 -left-[1.4rem] size-2 rounded-full border",
                    node.tone === "accent" ? "border-accent bg-accent" : "border-line-2 bg-surface",
                  )}
                />
                <div className="rounded-lg border border-line bg-bg-2 px-3 py-2">
                  <p className="text-sm font-medium text-fg">
                    {node.label}
                    {node.sub && (
                      <span className="ml-2 font-mono text-[0.68rem] font-normal text-fg-3">
                        {node.sub}
                      </span>
                    )}
                  </p>
                  {node.detail && (
                    <p className="mt-1 text-xs leading-relaxed text-fg-2">{node.detail}</p>
                  )}
                  {outgoing.length > 0 && (
                    <p className="mt-1.5 font-mono text-[0.68rem] text-fg-3">
                      <span className="sr-only">Connects to: </span>
                      <span aria-hidden>→ </span>
                      {outgoing
                        .map((e) => `${byId.get(e.to)?.label}${e.label ? ` (${e.label})` : ""}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </figure>
  );
}

function NodeShape({
  node,
  active,
  dim,
  onEnter,
}: {
  node: DiagramNode;
  active: boolean;
  dim: boolean;
  onEnter: () => void;
}) {
  const w = node.w ?? NODE_W;
  const tone = node.tone ?? "default";
  const stroke = active
    ? "var(--accent)"
    : tone === "accent"
      ? "color-mix(in oklab, var(--accent) 45%, var(--line-2))"
      : "var(--line-2)";
  const fill =
    tone === "accent"
      ? "color-mix(in oklab, var(--accent) 7%, var(--surface))"
      : tone === "muted"
        ? "var(--bg-2)"
        : "var(--surface)";

  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      onMouseEnter={onEnter}
      style={{
        opacity: dim ? 0.45 : 1,
        transition: "opacity 150ms",
        cursor: node.detail ? "help" : "default",
      }}
    >
      <rect
        width={w}
        height={NODE_H}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={tone === "external" ? "5 4" : undefined}
      />
      {tone === "accent" && (
        <circle cx={w - 12} cy={12} r={2.5} fill="var(--accent)" className="pulse" />
      )}
      <text
        x={w / 2}
        y={node.sub ? 24 : 32}
        textAnchor="middle"
        className="fill-fg"
        fontSize={13}
        fontWeight={500}
      >
        {node.label}
      </text>
      {node.sub && (
        <text x={w / 2} y={41} textAnchor="middle" className="fill-fg-3 font-mono" fontSize={9.5}>
          {node.sub}
        </text>
      )}
    </g>
  );
}
