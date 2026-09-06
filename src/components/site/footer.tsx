import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl tracking-tight">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            {site.tagline} Studio and on-location headshot sessions in{" "}
            {site.location}.
          </p>
        </div>
        <div>
          <p className="eyebrow">Studio</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/portfolio" className="hover:text-brass-2">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-brass-2">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-brass-2">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brass-2">
                Book a session
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Clients</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/g" className="hover:text-brass-2">
                Open your gallery
              </Link>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-brass-2">
                {site.email}
              </a>
            </li>
            <li>
              <Link href="/login" className="text-muted hover:text-brass-2">
                Studio login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line/70 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.legalName}. All rights reserved.
        </p>
        <p>Images may not be reproduced without written permission.</p>
      </div>
    </footer>
  );
}
