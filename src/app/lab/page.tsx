import type { Metadata } from "next";
import Link from "next/link";
import { demoMeta, demos } from "@/components/lab/demos";
import { Container, SectionHeader } from "@/components/ui/primitives";
import { getProject } from "@/content/projects";
import type { LabDemoId } from "@/content/types";

export const metadata: Metadata = {
  title: "Engineering lab",
  description:
    "Interactive simulations: a payment state machine, a double-entry ledger, a Kafka partition visualiser, a blockchain transaction explorer and an AI pipeline trace.",
  alternates: { canonical: "/lab" },
};

const order: LabDemoId[] = ["payment", "ledger", "kafka", "chain", "ai-pipeline"];

export default function LabPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Engineering lab"
        title="Systems you can poke."
        lead={
          <>
            Lightweight simulations of the systems described in the case studies. The logic is real
            and unit-tested — the ledger enforces balanced entries, the Kafka model uses
            Kafka&apos;s own murmur2 partitioner — but everything runs in your browser. No
            infrastructure is behind these.
          </>
        }
      />

      <nav aria-label="Simulations" className="mt-10">
        <ol className="flex flex-wrap gap-2">
          {order.map((id, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex rounded-md border border-line px-3 py-1.5 font-mono text-xs text-fg-2 hover:border-line-2 hover:text-fg"
              >
                {String(i + 1).padStart(2, "0")} {demoMeta[id].title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-16 space-y-24">
        {order.map((id, i) => {
          const Demo = demos[id];
          const meta = demoMeta[id];
          const project = meta.project ? getProject(meta.project) : undefined;
          return (
            <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
              <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight">
                    {meta.title}
                  </h2>
                  <p className="mt-2 max-w-2xl leading-relaxed text-fg-2">{meta.description}</p>
                </div>
                {project && (
                  <Link href={`/projects/${project.slug}`} className="text-sm text-accent">
                    Case study: {project.title} →
                  </Link>
                )}
              </div>
              <Demo />
            </section>
          );
        })}
      </div>
    </Container>
  );
}
