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
    subject: `New inquiry: ${q.name} (${labelSessionType(q.session_type)})`,
    text: `${inquirySummary(q, packageName)}\n\nOpen in the studio: ${site.url}/admin/inquiries\nReply to this email to answer ${q.name.split(" ")[0]} directly.`,
  };
}

export function inquiryAutoReply(q: Inquiry) {
  const first = q.name.split(" ")[0];
  return {
    subject: `Got your message, ${first}`,
    text: `Hi ${first},

Thanks for reaching out. I received your inquiry and will reply within one business day with available dates and next steps.

What you sent:
${inquirySummary(q)}

If anything changes, just reply to this email.

${site.name}
${site.url}
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
  const until = input.expiresAt
    ? `\nThe gallery stays online until ${new Date(input.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "";
  if (input.kind === "proof") {
    return {
      subject: `Your proofs are ready — ${site.name}`,
      text: `Hi ${first},

Your proofs are ready to review:
${input.link}
Access code: ${input.code}

Open a photo, tap the heart to mark it as a favorite, and leave a note on any frame you would like adjusted. I retouch your picks from there.${until}

${site.name}
${site.email}`,
    };
  }
  return {
    subject: `Your final photos are ready — ${site.name}`,
    text: `Hi ${first},

Your retouched photos are ready to download:
${input.link}
Access code: ${input.code}

Each photo has a download button, and you can download everything at once.${until}

Thank you for working with me.

${site.name}
${site.email}`,
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
  const when = input.shootDate
    ? `\nSession date: ${new Date(input.shootDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
    : "";
  return {
    subject: `Payment received — order #${input.orderNumber}`,
    text: `Hi ${first},

Your payment of ${input.amount} for "${input.title}" (order #${input.orderNumber}) went through.${when}

I will be in touch to confirm the details. Your photos will be delivered to a private online gallery after the session.

${site.name}
${site.email}`,
  };
}
