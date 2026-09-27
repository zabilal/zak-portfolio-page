import type { Metadata } from "next";
import { CareerPath } from "@/components/sections/CareerPath";
import { ExploringGrid, LanguageTiers, PrinciplesGrid } from "@/components/sections/sections";
import { ArrowLink, Container, Placeholder, SectionHeader } from "@/components/ui/primitives";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zakariya Raji — a software engineer who moved from building applications to building financial infrastructure, distributed systems, blockchain and AI systems.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="space-y-24 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <SectionHeader
          as="h1"
          eyebrow="About"
          title="I like the part of the system where mistakes are expensive."
          lead={
            <div className="space-y-5">
              <p>
                I started where most engineers start: building software and making it work. The work
                that kept pulling me in was always one layer down — not the screen, but what happens
                when the request behind it is retried, or the service it depends on goes quiet
                halfway through.
              </p>
              <p>
                Fintech made that concrete. In banking, payments and mobile money, a race condition
                is someone&apos;s rent and a timeout is a customer asking where their money went. I
                learned to design ledgers that can explain every balance, payment flows that reach a
                correct final state no matter which hop fails, and event pipelines where a duplicate
                is harmless.
              </p>
              <p>
                Blockchain and AI are where that thinking goes next. A smart contract is a ledger
                with an adversarial public API. An AI system is a distributed system with one very
                unreliable component. The tools are new; the discipline is the same.
              </p>
              {/* <p className="text-base">
                <Placeholder label="A sentence or two in your own words — what got you into this" />
              </p> */}
            </div>
          }
        />
        <aside
          aria-label="In short"
          className="self-start rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-24"
        >
          <p className="eyebrow">In short</p>
          <dl className="mt-5 space-y-4 text-sm">
            {[
              ["Role", site.role],
              ["Core", "Backend & distributed systems in fintech"],
              ["Languages", "Java · Go · TypeScript"],
              ["Domains", "Banking · Payments · Ledgers · Settlement"],
              ["Expanding into", "Blockchain · AI engineering"],
              ["Based in", site.location],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3">
                <dt className="font-mono text-xs text-fg-3">{k}</dt>
                <dd className="text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-line pt-4 font-mono text-[0.7rem] leading-relaxed text-fg-3">
            {site.principle}
          </p>
        </aside>
      </div>

      <section aria-labelledby="journey">
        <SectionHeader
          id="journey"
          eyebrow="The journey"
          title="Increasingly complex problems, increasingly powerful engineering tools."
        />
        <div className="mt-10">
          <CareerPath projects={projects.map((p) => ({ slug: p.slug, title: p.title }))} />
        </div>
      </section>

      <section aria-labelledby="principles" className="scroll-mt-24">
        <SectionHeader
          id="principles"
          eyebrow="How I think about engineering"
          title="Eight principles I actually use."
          lead="Not rules. Defaults I start from and deviate from only with a reason."
        />
        <div className="mt-10">
          <PrinciplesGrid />
        </div>
      </section>

      <section aria-labelledby="languages">
        <SectionHeader id="languages" eyebrow="Languages" title="What I write, and how well." />
        <div className="mt-10">
          <LanguageTiers />
        </div>
      </section>

      <section aria-labelledby="now">
        <SectionHeader id="now" eyebrow="Currently exploring" title="What I'm working on now." />
        <div className="mt-10">
          <ExploringGrid />
        </div>
        <ArrowLink href="/contact" className="mt-10">
          Get in touch
        </ArrowLink>
      </section>
    </Container>
  );
}
