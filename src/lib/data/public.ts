import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Package, PortfolioImage } from "@/lib/types";

export type PublicPortfolioImage = PortfolioImage & { url: string };

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

/** Published portfolio images with public URLs. Empty when Supabase is not configured yet. */
export const getPortfolio = cache(
  async (category?: string): Promise<PublicPortfolioImage[]> => {
    if (!configured()) return [];
    const supabase = await createClient();
    let query = supabase
      .from("portfolio_images")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as PortfolioImage[]).map((img) => ({
      ...img,
      url: supabase.storage.from("portfolio").getPublicUrl(img.storage_path)
        .data.publicUrl,
    }));
  }
);

export const getFeaturedPortfolio = cache(async (limit = 6) => {
  const all = await getPortfolio();
  const featured = all.filter((i) => i.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
});

export const getActivePackages = cache(async (): Promise<Package[]> => {
  if (!configured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return (data as Package[] | null) ?? [];
});
