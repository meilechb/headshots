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
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/70 backdrop-blur-lg">
      <div className="container-x flex h-14 items-center justify-between">
        <Link href="/" className="font-display text-sm leading-none tracking-[0.24em] text-ink">
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.12em] text-ink-2 transition hover:text-brass-2"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-secondary px-[18px] py-[9px]">
            Book a session
          </Link>
        </nav>

        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
