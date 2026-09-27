import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLink, Container, Tag } from "@/components/ui/primitives";
import { domainTitle } from "@/content/domains";
import { getNote, writtenNotes } from "@/content/notes";
import { site } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return writtenNotes.map((n) => ({ slug: n.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) return {};
  return {
    title: note.title,
    description: note.summary,
    alternates: { canonical: `/writing/${note.slug}` },
    openGraph: {
      title: note.title,
      description: note.summary,
      type: "article",
      authors: [site.name],
    },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note || note.planned) notFound();

  const { default: Body } = await import(`@/content/writing/${slug}.mdx`);
  const index = writtenNotes.findIndex((n) => n.slug === slug);
  const next = writtenNotes[(index + 1) % writtenNotes.length]!;

  return (
    <Container className="py-16 sm:py-24">
      <article className="mx-auto max-w-2xl">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-fg-3">
          <Link href="/writing" className="hover:text-fg">
            writing
          </Link>
          <span aria-hidden className="px-2">
            /
          </span>
          <span className="text-fg-2">{slug}</span>
        </nav>
        <header className="mt-8 border-b border-line pb-8">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-fg-3">
            {note.domains.map((d) => (
              <Link key={d} href={`/engineering/${d}`} className="hover:text-accent">
                {domainTitle(d)}
              </Link>
            ))}
            <span aria-hidden>·</span>
            <span>{note.readingMinutes} min read</span>
            {note.date && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={note.date}>{note.date}</time>
              </>
            )}
            {note.draft && <Tag className="text-warn">draft</Tag>}
          </div>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
            {note.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-fg-2">{note.summary}</p>
        </header>
        <div className="prose mt-10">
          <Body />
        </div>
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <ArrowLink href="/writing">All notes</ArrowLink>
          {next.slug !== slug && (
            <Link href={`/writing/${next.slug}`} className="group text-right">
              <span className="block font-mono text-[0.68rem] text-fg-3">next</span>
              <span className="text-fg group-hover:text-accent">{next.title} →</span>
            </Link>
          )}
        </footer>
      </article>
    </Container>
  );
}
