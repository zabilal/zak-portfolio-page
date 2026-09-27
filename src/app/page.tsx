import { EngineeringMap } from "@/components/home/EngineeringMap";
import { Hero } from "@/components/home/Hero";
import { demos } from "@/components/lab/demos";
import { ProjectCard } from "@/components/sections/ProjectCard";
import {
  ContactBlock,
  ExploringGrid,
  NotesList,
  PrinciplesGrid,
  RoleList,
} from "@/components/sections/sections";
import { ArrowLink, Container, SectionHeader } from "@/components/ui/primitives";
import { writtenNotes } from "@/content/notes";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function Home() {
  const featured = projects.filter((p) => p.featured);
  const [first, second, third, ...rest] = featured;
  const Ledger = demos.ledger;

  return (
    <>
      <Hero />

      <Container className="space-y-28 py-24 sm:space-y-36 sm:py-32">
        <section aria-labelledby="map-title" className="reveal">
          <SectionHeader
            id="map-title"
            index="01"
            eyebrow="What I build"
            title="Systems where failure has a cost."
            lead="Nine areas, one discipline. Select a node to see the technologies, concepts and case studies behind it — connected nodes light up."
          />
          <div className="mt-12">
            <EngineeringMap projects={projects.map((p) => ({ slug: p.slug, title: p.title }))} />
          </div>
        </section>

        <section aria-labelledby="work-title" className="reveal">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              id="work-title"
              index="02"
              eyebrow="Selected engineering"
              title="Case studies, not a project grid."
              lead="Each one follows the same structure: problem, constraints, architecture, decisions, tradeoffs, and what I learned. Each is labelled with exactly what it is."
            />
            <ArrowLink href="/projects">All case studies</ArrowLink>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[first, second, third].filter(Boolean).map((p) => (
              <ProjectCard key={p!.slug} project={p!} large />
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {rest.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>

        <section aria-labelledby="lab-title" className="reveal">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              id="lab-title"
              index="03"
              eyebrow="Engineering lab"
              title="Don't take my word for it — post a transfer."
              lead="A real double-entry ledger engine running in your browser. Try overdrawing an account, retrying with the same idempotency key, or reversing an entry."
            />
            <ArrowLink href="/lab">Open the lab</ArrowLink>
          </div>
          <div className="mt-12">
            <Ledger />
          </div>
        </section>

        <section aria-labelledby="experience-title" className="reveal">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeader
                id="experience-title"
                index="04"
                eyebrow="Experience"
                title="Banking, payments, and the infrastructure under them."
                lead="Mortgage banking, insurtech, mobile money and agent networks, cross-border payments, digital banking."
              />
              <ArrowLink href="/experience" className="mt-8">
                Full experience
              </ArrowLink>
            </div>
            <RoleList compact />
          </div>
        </section>

        <section aria-labelledby="principles-title" className="reveal">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              id="principles-title"
              index="05"
              eyebrow="How I think about engineering"
              title={site.principle}
            />
            <ArrowLink href="/about#principles">All principles</ArrowLink>
          </div>
          <div className="mt-12">
            <PrinciplesGrid limit={4} />
          </div>
        </section>

        <section aria-labelledby="exploring-title" className="reveal">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <SectionHeader
              id="exploring-title"
              index="06"
              eyebrow="Currently exploring"
              title="What I'm building next."
              lead="Active work outside my professional experience — labelled as such."
            />
            <ExploringGrid />
          </div>
        </section>

        <section aria-labelledby="notes-title" className="reveal">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionHeader
                id="notes-title"
                index="07"
                eyebrow="Engineering notes"
                title="Writing it down."
                lead="Ledgers, idempotency, isolation levels, Kafka — the details that decide whether a system is correct."
              />
              <ArrowLink href="/writing" className="mt-8">
                All notes
              </ArrowLink>
            </div>
            <NotesList notes={writtenNotes} />
          </div>
        </section>

        <ContactBlock />
      </Container>
    </>
  );
}
