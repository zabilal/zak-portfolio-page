import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — software engineer building financial infrastructure, distributed systems, AI and blockchain applications.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const bg = "#07090c";
const line = "#273141";
const fg = "#e7edf4";
const muted = "#7a8797";
const accent = "#5ec4ff";

function Node({ label, hot = false }: { label: string; hot?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "10px 18px",
        borderRadius: 10,
        border: `1.5px solid ${hot ? accent : line}`,
        background: hot ? "rgba(94,196,255,0.08)" : "#0e1218",
        color: hot ? fg : "#a3afbd",
        fontSize: 20,
      }}
    >
      {label}
    </div>
  );
}

function Arrow() {
  return (
    <div style={{ display: "flex", width: 28, height: 2, background: accent, opacity: 0.7 }} />
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: bg,
        backgroundImage: `linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          color: muted,
          fontSize: 22,
          letterSpacing: 3,
        }}
      >
        <div
          style={{ display: "flex", width: 10, height: 10, borderRadius: 10, background: accent }}
        />
        {site.url.replace("https://", "").toUpperCase()}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 88, fontWeight: 700, color: fg, letterSpacing: -3, lineHeight: 1 }}>
          {site.name}
        </div>
        <div
          style={{ marginTop: 26, fontSize: 36, color: "#a3afbd", lineHeight: 1.3, maxWidth: 960 }}
        >
          Software engineer building financial infrastructure, distributed systems, AI and
          blockchain applications.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Node label="API" />
        <Arrow />
        <Node label="Transaction service" />
        <Arrow />
        <Node label="Ledger" hot />
        <Arrow />
        <Node label="Kafka" />
        <Arrow />
        <Node label="Settlement" />
      </div>
    </div>,
    size,
  );
}
