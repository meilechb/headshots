import { areas } from "@/lib/areas";

export const linkedAreaSlugs = [
  "rockland-county",
  "spring-valley",
  "monsey",
  "nanuet",
  "new-city",
  "suffern",
  "airmont",
  "ramapo",
] as const;

export function linkedAreas() {
  return linkedAreaSlugs.map((slug) => {
    const area = areas.find((a) => a.slug === slug);
    if (!area) throw new Error(`Missing area: ${slug}`);
    return { name: area.name, slug: area.slug, href: `/headshots/${area.slug}` as const };
  });
}
