import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./mobile-nav";

export const navItems = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-ink sm:text-2xl"
        >
          {site.name}
          <span className="ml-2 hidden text-xs font-sans uppercase tracking-[0.18em] text-muted sm:inline">
            Headshots
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-2 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-primary px-4 py-2">
            Book a session
          </Link>
        </nav>

        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
