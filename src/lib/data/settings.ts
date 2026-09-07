import "server-only";

import { cache } from "react";
import { sanitizePortfolioAlt } from "@/lib/image-alt";
import { db, dbConfigured, one } from "@/lib/db";

/** Key/value settings edited in the studio admin. Values are JSON strings. */

export type HeroImage = { url: string; width: number | null; height: number | null; alt: string };
export const HERO_KEY = "hero_image";

export async function getSetting(key: string): Promise<string | null> {
  if (!dbConfigured()) return null;
  try {
    const row = one<{ value: string }>(await db()`select value from site_settings where key = ${key} limit 1`);
    return row?.value ?? null;
  } catch (error) {
    console.error("getSetting failed", error);
    return null;
  }
}

export async function setSetting(key: string, value: string | null) {
  if (value === null) {
    await db()`delete from site_settings where key = ${key}`;
    return;
  }
  await db()`
    insert into site_settings (key, value, updated_at) values (${key}, ${value}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()`;
}

/** The home page header image chosen in the admin, or null when none is set. */
export const getHeroImage = cache(async (): Promise<HeroImage | null> => {
  const raw = await getSetting(HERO_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<HeroImage>;
    if (!parsed.url) return null;
    return { url: parsed.url, width: parsed.width ?? null, height: parsed.height ?? null, alt: sanitizePortfolioAlt(parsed.alt ?? "") };
  } catch {
    return null;
  }
});
