import { areas, townAreas, type Faq } from "@/lib/areas";
import { site, socialLinks } from "@/lib/site";

/** Shared structured data (schema.org JSON-LD) for the public site. */

const businessId = `${site.url}/#business`;
const personId = `${site.url}/#photographer`;

export function businessJsonLd() {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  };
  if (site.address.street) address.streetAddress = site.address.street;
  if (site.address.postalCode) address.postalCode = site.address.postalCode;

  const sameAs = socialLinks().map((l) => l.href);

  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": businessId,
    name: site.legalName,
    alternateName: site.name,
    description: site.description,
    url: site.url,
    image: `${site.url}/opengraph-image`,
    email: site.email,
    ...(site.phone ? { telephone: site.phone } : {}),
    address,
    areaServed: [
      { "@type": "AdministrativeArea", name: "Rockland County, NY" },
      ...townAreas.map((a) => ({ "@type": "City", name: a.fullName })),
    ],
    priceRange: "$$",
    founder: { "@id": personId },
    knowsAbout: [
      "Headshot photography",
      "Corporate headshots",
      "LinkedIn headshots",
      "Team headshots",
      "Actor headshots",
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function personJsonLd() {
  const sameAs = socialLinks().map((l) => l.href);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: site.founder,
    jobTitle: "Headshot photographer",
    url: site.url,
    email: site.email,
    worksFor: { "@id": businessId },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function serviceJsonLd(area: { fullName: string; heading: string; slug: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: area.heading,
    serviceType: "Headshot photography",
    description: area.description,
    url: `${site.url}/headshots/${area.slug}`,
    provider: { "@id": businessId },
    areaServed: { "@type": area.slug === "rockland-county" ? "AdministrativeArea" : "City", name: area.fullName },
  };
}

/** Every public URL, for the sitemap and internal links. */
export const publicPaths = [
  "/",
  "/portfolio",
  "/pricing",
  "/linkedin-headshots",
  "/team-headshots",
  "/contact",
  ...areas.map((a) => `/headshots/${a.slug}`),
];
