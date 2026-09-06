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
  tagline: "Headshots that look like you on your best day.",
  description:
    "Professional headshot photography for executives, teams, actors and personal brands. Studio and on-location sessions, fast turnaround, retouched files delivered online.",
  url: resolveSiteUrl(),
  email: "hello@meilechbiller.com",
  phone: "",
  location: "New York",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/",
} as const;
