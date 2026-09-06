export const site = {
  name: "Meilech Biller",
  legalName: "Meilech Biller Headshot Photography",
  shortName: "MB Headshots",
  tagline: "Headshots that look like you on your best day.",
  description:
    "Professional headshot photography for executives, teams, actors and personal brands. Studio and on-location sessions, fast turnaround, retouched files delivered online.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://meilechbiller.com",
  email: "hello@meilechbiller.com",
  phone: "",
  location: "New York",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/",
} as const;

export const portfolioCategories = [
  { slug: "corporate", label: "Corporate" },
  { slug: "personal-brand", label: "Personal Brand" },
  { slug: "actors", label: "Actors" },
  { slug: "teams", label: "Teams" },
  { slug: "creative", label: "Creative" },
] as const;

export type PortfolioCategory = (typeof portfolioCategories)[number]["slug"];
