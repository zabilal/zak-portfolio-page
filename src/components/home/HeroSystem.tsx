/**
 * The hero visual: four domains feeding one discipline. Packets travel toward the core and out
 * to infrastructure — the only motion on the page above the fold, and it means something.
 */
const nodes = [
  { id: "ai", label: "AI / ML", x: 200, y: 20 },
  { id: "chain", label: "Blockchain", x: 10, y: 170 },
  { id: "fin", label: "FinTech", x: 390, y: 170 },
  { id: "infra", label: "Distributed", sub: "infrastructure", x: 200, y: 320 },
] as const;

const W = 120;
const H = 48;
const core = { x: 175, y: 150, w: 170, h: 88 };

const edges = [
  { d: `M260,${20 + H} L260,${core.y}`, delay: "0s" },
  { d: `M${10 + W},194 L${core.x},194`, delay: "0.8s" },
  { d: `M390,194 L${core.x + core.w},194`, delay: "1.6s" },
  { d: `M260,${core.y + core.h} L260,320`, delay: "2.4s" },
];

export function HeroSystem() {
  return (
    <div className="rounded-xl border border-line bg-surface/70 p-4 backdrop-blur-sm sm:p-6">
      <div className="mb-3 flex items-center justify-between font-mono text-[0.65rem] text-fg-3">
        <span>system.overview</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="pulse size-1.5 rounded-full bg-accent" />
          live
        </span>
      </div>
      <svg
        viewBox="0 0 520 380"
        className="h-auto w-full"
        role="img"
        aria-label="Diagram: AI/ML, blockchain and fintech feed into systems engineering, which runs on distributed infrastructure."
      >
        <defs>
          <pattern id="hero-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="var(--line-2)" />
          </pattern>
        </defs>
        <rect width="520" height="380" fill="url(#hero-dots)" opacity="0.5" />

        {edges.map((e, i) => (
          <g key={i}>
            <path d={e.d} stroke="var(--line-2)" strokeWidth="1.25" fill="none" />
            <path
              d={e.d}
              pathLength={100}
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className="flow-packet"
              style={{ ["--flow-delay" as string]: e.delay, ["--flow-duration" as string]: "3.2s" }}
            />
          </g>
        ))}

        <g transform={`translate(${core.x} ${core.y})`}>
          <rect
            x="-8"
            y="-8"
            width={core.w + 16}
            height={core.h + 16}
            rx="14"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.25"
            strokeDasharray="2 5"
            className="pulse"
          />
          <rect
            width={core.w}
            height={core.h}
            rx="10"
            fill="color-mix(in oklab, var(--accent) 8%, var(--surface))"
            stroke="color-mix(in oklab, var(--accent) 55%, var(--line-2))"
          />
          <text
            x={core.w / 2}
            y="34"
            textAnchor="middle"
            className="fill-fg"
            fontSize="15"
            fontWeight="600"
            letterSpacing="0.14em"
          >
            SYSTEMS
          </text>
          <text
            x={core.w / 2}
            y="56"
            textAnchor="middle"
            className="fill-fg-3 font-mono"
            fontSize="9.5"
          >
            correct · observable
          </text>
          <text
            x={core.w / 2}
            y="70"
            textAnchor="middle"
            className="fill-fg-3 font-mono"
            fontSize="9.5"
          >
            resilient · understandable
          </text>
        </g>

        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
            <rect width={W} height={H} rx="8" fill="var(--surface)" stroke="var(--line-2)" />
            <text
              x={W / 2}
              y={"sub" in n ? 21 : 29}
              textAnchor="middle"
              className="fill-fg"
              fontSize="13"
              fontWeight="500"
            >
              {n.label}
            </text>
            {"sub" in n && (
              <text
                x={W / 2}
                y="36"
                textAnchor="middle"
                className="fill-fg-3 font-mono"
                fontSize="9.5"
              >
                {n.sub}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
