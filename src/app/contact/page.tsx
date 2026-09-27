import type { Metadata } from "next";
import { Container, Value } from "@/components/ui/primitives";
import { site } from "@/content/site";
import { isPending, type Maybe } from "@/content/types";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Zakariya Raji about engineering work in fintech, distributed systems, AI and blockchain.",
  alternates: { canonical: "/contact" },
};

type Channel = {
  label: string;
  value: Maybe<string>;
  href?: (v: string) => string;
  display?: (v: string) => string;
};

const channels: Channel[] = [
  { label: "Email", value: site.contact.email, href: (v) => `mailto:${v}` },
  {
    label: "GitHub",
    value: site.contact.github,
    href: (v) => `https://github.com/${v}`,
    display: (v) => `github.com/${v}`,
  },
  {
    label: "LinkedIn",
    value: site.contact.linkedin,
    href: (v) => v,
    display: (v) => v.replace(/^https?:\/\/(www\.)?/, ""),
  },
  {
    label: "X",
    value: site.contact.x,
    href: (v) => `https://x.com/${v.replace(/^@/, "")}`,
    display: (v) => `@${v.replace(/^@/, "")}`,
  },
];

export default function ContactPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
            Have a difficult system to build?
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fg-2">
            I&apos;m interested in ambitious engineering problems across fintech, distributed
            systems, AI and blockchain.
          </p>
          <p className="mt-4 max-w-lg leading-relaxed text-fg-3">
            The most useful first message says what the system does, what is going wrong or what
            needs to exist, and what constraints you&apos;re working under.
          </p>
        </div>

        <ul className="divide-y divide-line self-start rounded-xl border border-line bg-surface">
          {channels.map((c) => (
            <li key={c.label} className="grid grid-cols-[5.5rem_1fr] items-center gap-4 px-5 py-4">
              <span className="font-mono text-xs text-fg-3">{c.label}</span>
              {isPending(c.value) ? (
                <Value value={c.value} />
              ) : (
                <a
                  href={c.href?.(c.value)}
                  className="truncate text-fg hover:text-accent"
                  rel="noopener"
                >
                  {c.display ? c.display(c.value) : c.value}
                </a>
              )}
            </li>
          ))}
          <li className="grid grid-cols-[5.5rem_1fr] items-center gap-4 px-5 py-4">
            <span className="font-mono text-xs text-fg-3">CV</span>
            <a href="/resume" className="text-fg hover:text-accent">
              View or download resume →
            </a>
          </li>
        </ul>
      </div>
    </Container>
  );
}
