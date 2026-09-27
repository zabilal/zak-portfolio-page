import type { Diagram, DiagramNode } from "@/content/types";

export const NODE_W = 160;
export const NODE_H = 56;

type Point = { x: number; y: number };

function center(n: DiagramNode): Point {
  return { x: n.x + (n.w ?? NODE_W) / 2, y: n.y + NODE_H / 2 };
}

/**
 * Routes an edge as a cubic curve between the facing sides of two nodes.
 * Nodes on different rows connect bottom→top; nodes on the same row connect side→side.
 */
export function edgePath(a: DiagramNode, b: DiagramNode): { d: string; mid: Point } {
  const ac = center(a);
  const bc = center(b);
  const dy = bc.y - ac.y;
  const dx = bc.x - ac.x;

  if (Math.abs(dy) >= 80) {
    const down = dy > 0;
    const sy = down ? a.y + NODE_H : a.y;
    const ey = down ? b.y - 2 : b.y + NODE_H + 2;
    const my = (sy + ey) / 2;
    return {
      d: `M${ac.x},${sy} C${ac.x},${my} ${bc.x},${my} ${bc.x},${ey}`,
      mid: { x: (ac.x + bc.x) / 2, y: my },
    };
  }

  const right = dx > 0;
  const aw = a.w ?? NODE_W;
  const bw = b.w ?? NODE_W;
  const sx = right ? a.x + aw : a.x;
  const ex = right ? b.x - 2 : b.x + bw + 2;
  const mx = (sx + ex) / 2;
  return {
    d: `M${sx},${ac.y} C${mx},${ac.y} ${mx},${bc.y} ${ex},${bc.y}`,
    mid: { x: mx, y: (ac.y + bc.y) / 2 },
  };
}

/** Reading order for the list fallback: follow edges from the roots, then anything left by position. */
export function orderedNodes(diagram: Diagram): DiagramNode[] {
  const incoming = new Set(diagram.edges.filter((e) => !e.dashed).map((e) => e.to));
  const byPosition = [...diagram.nodes].sort((a, b) => a.y - b.y || a.x - b.x);
  const roots = byPosition.filter((n) => !incoming.has(n.id));
  const seen = new Set<string>();
  const out: DiagramNode[] = [];
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]));

  const queue = [...roots];
  while (queue.length) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    out.push(node);
    for (const e of diagram.edges) {
      if (e.from === node.id && !seen.has(e.to)) {
        const next = byId.get(e.to);
        if (next) queue.push(next);
      }
    }
  }
  for (const n of byPosition) if (!seen.has(n.id)) out.push(n);
  return out;
}
