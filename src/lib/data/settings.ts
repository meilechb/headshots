import "server-only";

import { cache } from "react";
import { sanitizePortfolioAlt } from "@/lib/image-alt";
import { templateKeys, type TemplateKey, type TemplateValues } from "@/lib/email-templates";
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

// ---------------------------------------------------------------- email templates

export const EMAIL_TEMPLATES_KEY = "email_templates";

export type EmailTemplateOverrides = Partial<Record<TemplateKey, Partial<TemplateValues>>>;

function parseOverrides(raw: string | null): EmailTemplateOverrides {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: EmailTemplateOverrides = {};
    for (const key of templateKeys) {
      const v = parsed[key];
      if (v && typeof v === "object") {
        const o = v as Record<string, unknown>;
        out[key] = {
          subject: typeof o.subject === "string" ? o.subject : undefined,
          body: typeof o.body === "string" ? o.body : undefined,
          cta_label: typeof o.cta_label === "string" ? o.cta_label : undefined,
        };
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** The studio's edits to the email templates, keyed by template. Missing keys use the defaults. */
export const getEmailTemplateOverrides = cache(async (): Promise<EmailTemplateOverrides> => {
  return parseOverrides(await getSetting(EMAIL_TEMPLATES_KEY));
});

/** Saves one template's edits, or removes them (null) to go back to the default. */
export async function saveEmailTemplateOverride(key: TemplateKey, values: TemplateValues | null) {
  const current = parseOverrides(await getSetting(EMAIL_TEMPLATES_KEY));
  if (values) current[key] = values;
  else delete current[key];
  const remaining = Object.keys(current).length;
  await setSetting(EMAIL_TEMPLATES_KEY, remaining ? JSON.stringify(current) : null);
}
