"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav, secondaryNav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu on navigation (adjusting state during render, not in an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`${site.name} — home`}
        >
          <span className="size-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line-2 transition-shadow group-hover:ring-accent/60">
            {/* Zoomed toward the face: the source photo has a lot of background. */}
            <Image
              src="/zakariya-raji.jpg"
              alt=""
              width={64}
              height={64}
              priority
              className="size-full origin-[57%_55%] scale-[1.7] object-cover"
            />
          </span>
          <span className="text-sm font-semibold tracking-tight text-fg">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive(item.href) ? "text-fg" : "text-fg-3 hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden h-8 items-center rounded-md border border-line-2 px-3 text-sm text-fg transition-colors hover:border-fg-3 md:inline-flex"
          >
            Contact
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border border-line text-fg-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
              {open ? (
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Primary"
        hidden={!open}
        className="border-t border-line bg-bg md:hidden"
      >
        <ul className="mx-auto max-w-6xl px-4 py-3">
          {[...primaryNav, ...secondaryNav].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between border-b border-line/60 py-3 text-base",
                  isActive(item.href) ? "text-fg" : "text-fg-2",
                )}
              >
                {item.label}
                <span aria-hidden className="font-mono text-xs text-fg-3">
                  {item.href}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/** Monogram: two nodes joined by an edge — the smallest possible system. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        rx="6"
        fill="var(--surface)"
        stroke="var(--line-2)"
      />
      <path
        d="M7 8h10L7 16h10"
        fill="none"
        stroke="var(--fg)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="8" r="1.8" fill="var(--accent)" />
    </svg>
  );
}
