import { site } from "@/content/site";
import { isPending } from "@/content/types";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { EventStream } from "./EventStream";
import { HeroSystem } from "./HeroSystem";

export function Hero() {
  const github = site.contact.github;
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg fade-mask" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--glow), transparent)" }}
      />
      <Container className="relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-28">
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 eyebrow">
            <span className="inline-flex items-center gap-2 text-fg-2">
              <span aria-hidden className="pulse size-1.5 rounded-full bg-ok" />
              {site.role}
            </span>
            <span aria-hidden className="text-line-2">
              /
            </span>
            <span>{site.location}</span>
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-5xl leading-[1.02] font-semibold tracking-[-0.035em] text-fg sm:text-6xl lg:text-7xl"
          >
            {site.name}
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-snug font-medium tracking-[-0.01em] text-balance text-fg sm:text-2xl">
            {site.headline}
          </p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-fg-2 sm:text-lg">
            {site.intro}
          </p>

          <p className="mt-6 font-mono text-[0.72rem] tracking-wide text-fg-3">
            {site.disciplines.map((d, i) => (
              <span key={d}>
                {i > 0 && (
                  <span aria-hidden className="px-2 text-line-2">
                    ·
                  </span>
                )}
                {d}
              </span>
            ))}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/projects" variant="primary">
              Explore engineering work
            </ButtonLink>
            {isPending(github) ? (
              <ButtonLink href="/open-source">View open source</ButtonLink>
            ) : (
              <ButtonLink href={`https://github.com/${github}`} rel="noopener">
                View GitHub
              </ButtonLink>
            )}
            <ButtonLink href="/resume" variant="ghost">
              Download CV <span aria-hidden>↓</span>
            </ButtonLink>
          </div>
        </div>

        <div className="relative">
          <HeroSystem />
          <EventStream />
        </div>
      </Container>
    </section>
  );
}
