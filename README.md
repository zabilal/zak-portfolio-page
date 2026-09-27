# zakariyaraji.dev

Engineering portfolio for Zakariya Raji. Next.js 16 (App Router, fully static), TypeScript, Tailwind CSS v4, MDX.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static production build (33 routes)
npm test             # unit + component tests (vitest)
npm run lint && npm run typecheck && npm run format:check
```

Whenever new additions are made to the site that should go intor your resume, follow instruction below:
Then regenerate the resume PDF: `npm run build && npm start`, and in another terminal `npm run resume:pdf`.

## Where things live

```
src/content/        all site content — typed data, no UI
  site.ts           identity, contact, nav
  projects.ts       case studies (Problem → What I learned) + status labels
  domains.ts        /engineering/[domain] pages
  diagrams.ts       architecture diagrams as data (nodes + edges)
  experience.ts     roles
  skills.ts         language tiers, skill groups, hover glossary, stack matrix
  philosophy.ts     principles, current exploration, career path
  map.ts            "What I build" interactive map
  notes.ts          note index; writing/<slug>.mdx holds the body
src/lib/            pure, tested engines behind the Lab (ledger, payment state machine, Kafka model, chain)
src/components/     UI: diagram/, lab/, home/, sections/, layout/, ui/
```

### Adding content

- **Case study** — add a `Project` to `src/content/projects.ts` (and a `Diagram` in `diagrams.ts`). The page, card, sitemap and resume entry follow.
- **Note** — add an entry to `notes.ts` and a matching `src/content/writing/<slug>.mdx`. Entries with `planned: true` are listed without a page.
- **Technology** — add it to a group in `skills.ts` and a one-line descriptor to `glossary` for the hover card.
- **Domain** — add a `Domain` to `domains.ts`.

### Honesty labels

Every case study carries a status: _Reference architecture_ (generalised from professional work, no employer specifics), _Prototype_, _Currently building_, _Research_ or _Concept_. The Lab states that it is an in-browser simulation. Keep it that way.

## Engineering notes

- Fully static: every route is prerendered; the only runtime fetch is the GitHub API on `/open-source` (daily revalidation, only once a username is set; `GITHUB_TOKEN` optional).
- JavaScript is limited to interactive islands. Each Lab simulator is a separate chunk, loaded only where it appears.
- Motion is CSS and always carries meaning (packets along real edges). It is disabled under `prefers-reduced-motion`.
- Diagrams render as SVG on desktop and as an ordered step list on mobile and for screen readers.
- The Kafka model's murmur2 is verified against Kafka's own test vectors (`src/lib/lib.test.ts`).
- Dark by default; the light theme persists via `localStorage` and is applied before first paint.
