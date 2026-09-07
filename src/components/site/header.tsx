import Link from "next/link";
import { site } from "@/lib/site";
import { MobileNav } from "./mobile-nav";

export const navItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/portfolio", label: "Portfolio" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/70 backdrop-blur-lg">
      <div className="container-x flex h-14 items-center justify-between">
        <Link href="/" className="font-display text-sm uppercase leading-none tracking-[0.2em] text-ink">
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-2 transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="btn-secondary px-[18px] py-[9px]">
            Contact
          </Link>
        </nav>

        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
