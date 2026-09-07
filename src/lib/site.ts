/**
 * Canonical public origin for metadata, sitemap, robots, and JSON-LD.
 * Prefer NEXT_PUBLIC_SITE_URL when it is a real production-style host.
 * Never fall back to VERCEL_URL / *.vercel.app preview hosts for public metadata.
 */
export const PRODUCTION_SITE_URL = "https://www.meilechbiller.com";

function normalizeOrigin(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProto);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function isVercelPreviewHost(origin: string) {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "vercel.app" || host.endsWith(".vercel.app");
  } catch {
    return true;
  }
}

function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
    ? normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    : null;
  if (explicit && !isVercelPreviewHost(explicit)) return explicit;
  // Do not use VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL for public metadata.
  return PRODUCTION_SITE_URL;
}

export const site = {
  name: "Meilech Biller",
  legalName: "Meilech Biller Headshot Photography",
  shortName: "MB Headshots",
  founder: "Meilech Biller",
  tagline: "Professional headshots in Rockland County, NY.",
  description:
    "Professional headshot photographer in Rockland County, NY. Business, LinkedIn, team and actor headshots in the studio or at your office in Spring Valley, Monsey, Nanuet, New City, Suffern and nearby.",
  url: resolveSiteUrl(),
  email: "hello@meilechbiller.com",
  // Leave phone empty to hide it everywhere. Format: +1 845 555 0100
  phone: "",
  // Region shown in copy. The street address is only used for structured data
  // and the contact page; leave street/postalCode empty until confirmed.
  location: "Rockland County, NY",
  address: {
    street: "",
    locality: "Spring Valley",
    region: "NY",
    postalCode: "",
    country: "US",
  },
  // Social profiles. Empty strings are left out of the page and the structured data.
  instagram: "",
  linkedin: "",
  googleBusinessProfile: "",
};

/** Social links that are actually set. */
export function socialLinks() {
  return [
    { label: "Instagram", href: site.instagram },
    { label: "LinkedIn", href: site.linkedin },
    { label: "Google", href: site.googleBusinessProfile },
  ].filter((l) => l.href);
}
