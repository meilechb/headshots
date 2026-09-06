import "server-only";

import { cache } from "react";
import { db, dbConfigured, rows } from "@/lib/db";
import type { Package, PortfolioImage } from "@/lib/types";

/** Published portfolio images. Empty until the database is connected. */
export const getPortfolio = cache(
  async (category?: string): Promise<PortfolioImage[]> => {
    if (!dbConfigured()) return [];
    try {
      const result = category
        ? await db()`
            select * from portfolio_images
            where is_published and category = ${category}
            order by sort_order asc, created_at desc`
        : await db()`
            select * from portfolio_images
            where is_published
            order by sort_order asc, created_at desc`;
      return rows<PortfolioImage>(result);
    } catch (error) {
      console.error("getPortfolio failed", error);
      return [];
    }
  }
);

export const getFeaturedPortfolio = cache(async (limit = 6) => {
  const all = await getPortfolio();
  const featured = all.filter((i) => i.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
});

export const getActivePackages = cache(async (): Promise<Package[]> => {
  if (!dbConfigured()) return [];
  try {
    const result = await db()`
      select * from packages where is_active order by sort_order asc`;
    return rows<Package>(result);
  } catch (error) {
    console.error("getActivePackages failed", error);
    return [];
  }
});
