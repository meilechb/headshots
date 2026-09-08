import "server-only";

import { cookies, headers } from "next/headers";
import { GA_MEASUREMENT_ID, type GaParams } from "@/lib/analytics";

/**
 * Server-side GA4 events through the Measurement Protocol
 * (https://developers.google.com/analytics/devguides/collection/protocol/ga4).
 *
 * Needs GA_API_SECRET (Admin → Data streams → stream → Measurement Protocol
 * API secrets). Without it every send is skipped and returns false, so the
 * calling code never depends on analytics being configured.
 */

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

/** Who the event belongs to, taken from the gtag.js cookies of the visitor's browser. */
export type GaVisitor = {
  /** Full `_ga` cookie value (or "n.n" client id). The protocol accepts either. */
  clientId: string;
  /** Full `_ga_<stream>` cookie value, so the event joins the visitor's current session. */
  sessionId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
};

export function serverAnalyticsConfigured() {
  return Boolean(GA_MEASUREMENT_ID && process.env.GA_API_SECRET?.trim());
}

/**
 * Reads the visitor's GA cookies from the current request. Returns null when
 * the tag has not set a `_ga` cookie yet (blocked, first request, or a
 * server-to-server call such as a Stripe webhook).
 */
export async function readGaVisitor(): Promise<GaVisitor | null> {
  if (!GA_MEASUREMENT_ID) return null;
  try {
    const [jar, head] = await Promise.all([cookies(), headers()]);
    const clientId = jar.get("_ga")?.value?.trim();
    if (!clientId) return null;
    const sessionId = jar.get(`_ga_${GA_MEASUREMENT_ID.slice(2)}`)?.value?.trim() || null;
    const ip = head.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    return { clientId, sessionId, userAgent: head.get("user-agent"), ip };
  } catch {
    // Outside a request scope (static render, scripts).
    return null;
  }
}

/** Stripe metadata keys that carry the visitor through Checkout to the webhook. */
const META_CLIENT = "ga_client_id";
const META_SESSION = "ga_session_id";

export function gaVisitorToMetadata(visitor: GaVisitor | null): Record<string, string> {
  if (!visitor) return {};
  // Stripe metadata values are limited to 500 characters.
  const meta: Record<string, string> = { [META_CLIENT]: visitor.clientId.slice(0, 500) };
  if (visitor.sessionId) meta[META_SESSION] = visitor.sessionId.slice(0, 500);
  return meta;
}

export function gaVisitorFromMetadata(
  metadata: Record<string, string> | null | undefined
): GaVisitor | null {
  const clientId = metadata?.[META_CLIENT]?.trim();
  if (!clientId) return null;
  return { clientId, sessionId: metadata?.[META_SESSION]?.trim() || null };
}

/** A client id in the documented "two positive numbers" shape for events with no browser context. */
function anonymousVisitor(): GaVisitor {
  const rand = Math.floor(Math.random() * 1e10);
  const seconds = Math.floor(Date.now() / 1000);
  return { clientId: `${rand}.${seconds}` };
}

/**
 * Sends one event. Resolution order for the visitor: the one passed in, then
 * the current request's cookies, then an anonymous client id (the event still
 * counts, but is not tied to a session or traffic source).
 * Never throws; failures are logged and reported as false.
 */
export async function sendServerEvent(
  name: string,
  params: GaParams,
  visitor?: GaVisitor | null
): Promise<boolean> {
  const secret = process.env.GA_API_SECRET?.trim();
  if (!GA_MEASUREMENT_ID || !secret) return false;

  const who = visitor ?? (await readGaVisitor()) ?? anonymousVisitor();
  const url = new URL(MP_ENDPOINT);
  url.searchParams.set("measurement_id", GA_MEASUREMENT_ID);
  url.searchParams.set("api_secret", secret);

  const body = {
    client_id: who.clientId,
    ...(who.userAgent ? { user_agent: who.userAgent } : {}),
    ...(who.ip ? { ip_override: who.ip } : {}),
    events: [
      {
        name,
        params: {
          ...(who.sessionId ? { session_id: who.sessionId } : {}),
          // Required alongside session_id for the event to count in standard reports.
          engagement_time_msec: 100,
          ...params,
        },
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("GA4 Measurement Protocol returned", res.status);
    return res.ok;
  } catch (error) {
    console.error("GA4 Measurement Protocol request failed", error);
    return false;
  }
}
