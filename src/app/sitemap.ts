import type { MetadataRoute } from "next";
import { areas } from "@/lib/areas";
import { site } from "@/lib/site";

// Update when page content changes so crawlers know to revisit.
const updated = new Date("2026-09-06");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  return [
    { url: base, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/portfolio`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/headshots`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
    ...areas.map((a) => ({
      url: `${base}/headshots/${a.slug}`,
      lastModified: updated,
      changeFrequency: "monthly" as const,
      priority: a.slug === "rockland-county" ? 0.8 : 0.7,
    })),
    { url: `${base}/about`, lastModified: updated, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: updated, changeFrequency: "yearly", priority: 0.7 },
  ];
}
