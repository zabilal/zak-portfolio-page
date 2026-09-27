export type Repo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  pushedAt: string;
};

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

/**
 * Public repositories from the GitHub API, refreshed daily at most.
 * Returns null on any failure so the page can say so instead of showing invented data.
 */
export async function fetchRepos(username: string): Promise<Repo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 86_400 },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ApiRepo[];
    return data
      .filter((r) => !r.fork && !r.archived)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        topics: r.topics ?? [],
        pushedAt: r.pushed_at,
      }))
      .sort((a, b) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt))
      .slice(0, 12);
  } catch {
    return null;
  }
}
