"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function MobileNav({
  items,
}: {
  items: ReadonlyArray<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  // The menu is "open" only for the path it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null);

  // Keep the page from scrolling behind the menu.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink"
      >
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden>
          {open ? (
            <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {/* Portaled: the blurred header is a containing block for fixed children. */}
      {open
        ? createPortal(
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto border-t border-line bg-paper px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line/70 py-4 text-lg text-ink"
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary mt-6 py-4">
              Book a session
            </Link>
            <Link
              href="/g"
              onClick={() => setOpen(false)}
              className="mt-4 py-2 text-center text-xs uppercase tracking-[0.12em] text-ink-2"
            >
              Open your client gallery
            </Link>
          </nav>
        </div>,
        document.body
          )
        : null}
    </div>
  );
}
