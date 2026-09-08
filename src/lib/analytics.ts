/**
 * Google Analytics 4. Shared by the browser (gtag.js) and the server
 * (Measurement Protocol, see analytics-server.ts).
 *
 * The measurement ID comes from NEXT_PUBLIC_GA_MEASUREMENT_ID at build time.
 * When it is unset the tag is not loaded and every track call is a no-op.
 */

const RAW_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();

/** "G-XXXXXXXXXX" or "" when analytics is off. Only well-formed ids are accepted. */
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/.test(RAW_ID) ? RAW_ID : "";

/** Studio and login pages never load the tag or send events. */
const UNTRACKED_PREFIXES = ["/admin", "/login"];

export function isTrackedPath(pathname: string) {
  return !UNTRACKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Event names sent by this site. Documented so GA key events match the code. */
export const GA_EVENTS = {
  /** A real contact inquiry was saved (server-side). */
  generateLead: "generate_lead",
  /** A Stripe Checkout payment was recorded (server-side). */
  purchase: "purchase",
  /** "Book" / "Get a quote" on the pricing page was clicked (client-side). */
  bookCtaClick: "book_cta_click",
  /** A client entered a valid gallery access code (server-side). */
  galleryUnlock: "gallery_unlock",
} as const;

export type GaItem = {
  item_id?: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
};

export type GaParams = Record<string, string | number | boolean | GaItem[] | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends an event from the browser through gtag.js. Safe to call from any
 * client component: it does nothing on the server, without a measurement id,
 * or before the tag has loaded.
 */
export function trackEvent(name: string, params?: GaParams) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params ?? {});
}
