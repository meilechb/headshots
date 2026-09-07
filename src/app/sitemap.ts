import type { MetadataRoute } from "next";
import { areas } from "@/lib/areas";
import { PRODUCTION_SITE_URL, site } from "@/lib/site";

// Update when page content changes so crawlers know to revisit.
const updated = "2026-09-07";

/**
 * Public sitemap. Uses the hardened production origin so preview hosts never
 * leak into Google. Kept synchronous and free of request-time APIs so the
 * metadata route stays static and avoids intermittent 500s.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url || PRODUCTION_SITE_URL;
  try {
    return [
      { url: base, lastModified: updated, changeFrequency: "monthly", priority: 1 },
      { url: `${base}/portfolio`, lastModified: updated, changeFrequency: "weekly", priority: 0.9 },
      { url: `${base}/pricing`, lastModified: updated, changeFrequency: "monthly", priority: 0.8 },
      { url: `${base}/linkedin-headshots`, lastModified: updated, changeFrequency: "monthly", priority: 0.85 },
      { url: `${base}/team-headshots`, lastModified: updated, changeFrequency: "monthly", priority: 0.85 },
      ...areas.map((a) => ({
        url: `${base}/headshots/${a.slug}`,
        lastModified: updated,
        changeFrequency: "monthly" as const,
        priority: a.slug === "rockland-county" ? 0.8 : 0.7,
      })),
      { url: `${base}/contact`, lastModified: updated, changeFrequency: "yearly", priority: 0.7 },
    ];
  } catch (error) {
    console.error("sitemap generation failed", error);
    return [{ url: PRODUCTION_SITE_URL, lastModified: updated, changeFrequency: "monthly", priority: 1 }];
  }
}
