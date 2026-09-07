import "server-only";

import { site } from "@/lib/site";
import { locationPrefs, sessionTypes, type Inquiry } from "@/lib/types";

/** Email texts. Kept plain; the sender formats them as HTML. */

export function labelSessionType(value: string | null) {
  return sessionTypes.find((s) => s.value === value)?.label ?? value ?? "Not specified";
}

export function labelLocation(value: string | null) {
  return locationPrefs.find((l) => l.value === value)?.label ?? value ?? "Not specified";
}

export function inquirySummary(q: Inquiry, packageName?: string | null) {
  const lines = [
    `Name: ${q.name}`,
    `Email: ${q.email}`,
    q.phone ? `Phone: ${q.phone}` : null,
    `Session: ${labelSessionType(q.session_type)}`,
    q.people_count ? `People: ${q.people_count}` : null,
    packageName || q.package_slug ? `Package: ${packageName ?? q.package_slug}` : null,
    `Where: ${labelLocation(q.location_pref)}`,
    q.town ? `Town: ${q.town}` : null,
    q.timing ? `Timing: ${q.timing}` : null,
    q.source ? `Heard about me: ${q.source}` : null,
    q.message ? `\nMessage:\n${q.message}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

export function inquiryNotification(q: Inquiry, packageName?: string | null) {
  return {
    subject: `New inquiry: ${q.name}`,
    text: `${inquirySummary(q, packageName)}\n\nReply to this email to answer ${q.name.split(" ")[0]} directly.`,
    cta: { label: "Open in the studio", url: `${site.url}/admin/clients${q.client_id ? `/${q.client_id}` : ""}` },
  };
}

export function inquiryAutoReply(q: Inquiry) {
  const first = q.name.split(" ")[0];
  return {
    subject: `Got your message, ${first}`,
    text: `Hi ${first},

Got your message. I reply within one business day.

${site.name}
${site.email}`,
  };
}

export function galleryReadyEmail(input: {
  clientName: string;
  kind: "proof" | "final";
  link: string;
  code: string;
  expiresAt?: string | null;
}) {
  const first = input.clientName.split(" ")[0];
  const what = input.kind === "proof" ? "Your proofs are ready" : "Your photos are ready";
  return {
    subject: `${what}: ${site.name}`,
    text: `Hi ${first},

${what}.
Code: ${input.code}
${input.link}

${site.name}
${site.email}`,
    cta: { label: input.kind === "proof" ? "See your proofs" : "See your photos", url: input.link },
  };
}

export function paymentReceiptEmail(input: {
  clientName: string;
  orderNumber: number;
  title: string;
  amount: string;
  shootDate: string | null;
}) {
  const first = input.clientName.split(" ")[0];
  return {
    subject: `Payment received: ${site.name}`,
    text: `Hi ${first},

Payment of ${input.amount} received for ${input.title}. Thank you.

${site.name}
${site.email}`,
  };
}
