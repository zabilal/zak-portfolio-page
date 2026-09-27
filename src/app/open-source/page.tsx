import type { Metadata } from "next";
import { Container, Placeholder, SectionHeader, Tag } from "@/components/ui/primitives";
import { site } from "@/content/site";
import { isPending } from "@/content/types";
import { fetchRepos, type Repo } from "@/lib/github";

export const metadata: Metadata = {
  title: "Open source",
  description:
    "Open-source projects, contributions and experiments across distributed systems, blockchain and developer infrastructure.",
  alternates: { canonical: "/open-source" },
};

export default async function OpenSourcePage() {
  const username = site.contact.github;
  const repos = isPending(username) ? null : await fetchRepos(username);

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeader
        as="h1"
        eyebrow="Open source"
        title="Code in the open."
        lead="Currently exploring and contributing to projects across distributed systems, blockchain, developer infrastructure and open-source software."
      />

      <div className="mt-14">
        {isPending(username) ? (
          <div className="rounded-xl border border-dashed border-line-2 p-6 sm:p-8">
            <p className="text-fg-2">
              Repositories are fetched from the GitHub API at build time and refreshed daily — stars
              and forks shown here are always real, never typed in.
            </p>
            <p className="mt-4">
              <Placeholder label="GitHub username in src/content/site.ts" />
            </p>
          </div>
        ) : repos === null ? (
          <p className="rounded-xl border border-line p-6 text-fg-2">
            GitHub is unavailable right now.{" "}
            <a href={`https://github.com/${username}`} className="text-accent">
              View repositories on GitHub →
            </a>
          </p>
        ) : repos.length === 0 ? (
          <p className="text-fg-2">No public repositories yet.</p>
        ) : (
          <RepoGrid repos={repos} />
        )}
      </div>
    </Container>
  );
}

function RepoGrid({ repos }: { repos: Repo[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {repos.map((r) => (
        <li
          key={r.name}
          className="relative flex flex-col rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-2"
        >
          <h2 className="font-mono text-sm text-fg">
            <a href={r.url} rel="noopener" className="after:absolute after:inset-0">
              {r.name}
            </a>
          </h2>
          {r.description && (
            <p className="mt-2 text-sm leading-relaxed text-fg-2">{r.description}</p>
          )}
          {r.topics.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-1.5">
              {r.topics.slice(0, 5).map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </p>
          )}
          <p className="mt-auto flex gap-4 pt-4 font-mono text-[0.7rem] text-fg-3">
            {r.language && <span>{r.language}</span>}
            <span>★ {r.stars}</span>
            <span>forks {r.forks}</span>
            <span>updated {r.pushedAt.slice(0, 10)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
