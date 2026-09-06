import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client gallery",
  robots: { index: false, follow: false },
};

export default function GalleryLayout({ children }: LayoutProps<"/g">) {
  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="container-x flex h-14 items-center justify-between">
          <Link href="/" className="font-display text-lg tracking-tight">
            {site.name}
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">
            Client gallery
          </span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        Questions about your photos?{" "}
        <a href={`mailto:${site.email}`} className="underline hover:text-ink">
          {site.email}
        </a>
      </footer>
    </>
  );
}
