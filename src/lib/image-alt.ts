import { site } from "@/lib/site";

/** Default public alt when a stored value is empty or looks like a filename/ID. */
export function defaultPortfolioAlt() {
  return `Professional headshot photographed by ${site.name} in Rockland County, NY`;
}

/**
 * Replace numeric IDs, ChatGPT export names, and camera/WhatsApp filenames
 * with a descriptive alt. Does not invent client names.
 */
export function sanitizePortfolioAlt(raw: string | null | undefined): string {
  const fallback = defaultPortfolioAlt();
  const alt = (raw ?? "").trim();
  if (!alt) return fallback;
  if (/chatgpt\s*image/i.test(alt)) return fallback;
  if (/^\d+$/.test(alt)) return fallback;
  // Camera / messenger export stems: IMG 123, MG 3364, DSC_…, WA0053, etc.
  if (/^(img|dscn?|pict|mg|photo|screenshot|image)\b/i.test(alt)) return fallback;
  if (/\bwa\d{3,}\b/i.test(alt)) return fallback;
  return alt;
}

/** Build an alt from an upload filename, falling back when the stem is not descriptive. */
export function altFromFilename(filename: string): string {
  const stem = filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").trim().slice(0, 200);
  return sanitizePortfolioAlt(stem);
}
