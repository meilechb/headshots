import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Always advertise the production sitemap URL for crawlers.
  const sitemapUrl = `${PRODUCTION_SITE_URL}/sitemap.xml`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/g/", "/pay/", "/api/", "/login"],
      },
    ],
    // Prefer the hardened public origin; sitemap line is pinned to www.
    host: site.url,
    sitemap: sitemapUrl,
  };
}
