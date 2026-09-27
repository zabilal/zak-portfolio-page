import Link from "next/link";
import { primaryNav, secondaryNav, site } from "@/content/site";
import { Container } from "@/components/ui/primitives";
import { Mark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-line">
      <Container className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Mark />
            <span className="text-sm font-semibold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-sm font-mono text-xs leading-relaxed text-fg-3">
            {site.principle}
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-fg-2 hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More">
          <p className="eyebrow">More</p>
          <ul className="mt-4 space-y-2 text-sm">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-fg-2 hover:text-fg">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-6 font-mono text-[0.7rem] text-fg-3 sm:flex-row sm:justify-between">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>Built with Next.js · statically generated · no trackers</span>
      </Container>
    </footer>
  );
}
