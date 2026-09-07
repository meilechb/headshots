/**
 * Public address of the site. Uses NEXT_PUBLIC_SITE_URL when set, otherwise the
 * address Vercel assigns to the deployment, otherwise the real domain.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "https://meilechbiller.com";
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
