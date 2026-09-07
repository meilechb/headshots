import Link from "next/link";
import { linkedAreas } from "@/lib/area-nav";
import { site, socialLinks } from "@/lib/site";

export function SiteFooter() {
  const socials = socialLinks();
  const areas = linkedAreas();
  return (
    <footer className="mt-24 border-t border-line bg-paper-2/60">
      <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl uppercase tracking-[0.12em]">{site.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
            Headshot photographer in {site.location}. Studio in {site.address.locality} and
            on-location sessions at offices across the county.
          </p>
          <p className="mt-3 text-sm">
            <a href={`mailto:${site.email}`} className="inline-block py-1 hover:text-brass-2">
              {site.email}
            </a>
            {site.phone ? (
              <>
                <br />
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="inline-block py-1 hover:text-brass-2">
                  {site.phone}
                </a>
              </>
            ) : null}
          </p>
          {socials.length ? (
            <ul className="mt-2 flex flex-wrap gap-4 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="me noreferrer" target="_blank" className="inline-block py-1 hover:text-brass-2">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Site</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/portfolio" className="inline-block py-1 hover:text-brass-2">Portfolio</Link></li>
            <li><Link href="/pricing" className="inline-block py-1 hover:text-brass-2">Pricing</Link></li>
            <li><Link href="/contact" className="inline-block py-1 hover:text-brass-2">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Clients</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/g" className="inline-block py-1 hover:text-brass-2">Open your gallery</Link></li>
            <li><Link href="/login" className="inline-block py-1 text-muted hover:text-brass-2">Studio login</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Headshots near you</p>
          <ul className="mt-3 columns-2 gap-x-6 space-y-1.5 text-sm">
            {areas.map((a) => (
              <li key={a.slug} className="break-inside-avoid">
                <Link href={a.href} className="inline-block py-1 hover:text-brass-2">
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line/70 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
        <p>Photos may not be reproduced without written permission.</p>
      </div>
    </footer>
  );
}
