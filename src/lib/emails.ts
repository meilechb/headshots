import "server-only";

import { getEmailTemplateOverrides } from "@/lib/data/settings";
import {
  formatAgreement,
  getTemplate,
  renderValues,
  resolveValues,
  type TemplateKey,
} from "@/lib/email-templates";
import { site } from "@/lib/site";
import type { ContractSection } from "@/lib/contract";
import { locationPrefs, sessionTypes, type Inquiry } from "@/lib/types";

/**
 * Email texts. Each one is a template from lib/email-templates.ts, with the
 * studio's edits applied. The sender formats the text as HTML.
 */

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

export type RenderedEmail = { subject: string; text: string; cta?: { label: string; url: string } };

/** Renders a template with the studio's saved edits and the given values. */
export async function renderEmail(
  key: TemplateKey,
  vars: Record<string, string>,
  ctaUrl?: string | null
): Promise<RenderedEmail> {
  const def = getTemplate(key);
  if (!def) throw new Error(`Unknown email template: ${key}`);
  const overrides = await getEmailTemplateOverrides();
  return renderValues(def, resolveValues(def, overrides[key]), vars, ctaUrl);
}

/** The template filled with its sample values, for previews and test sends. */
export async function renderEmailSample(key: TemplateKey): Promise<RenderedEmail> {
  const def = getTemplate(key);
  if (!def) throw new Error(`Unknown email template: ${key}`);
  return renderEmail(key, def.sample, def.sampleCtaUrl);
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

export function inquiryNotification(q: Inquiry, packageName?: string | null) {
  return renderEmail(
    "inquiry_notice",
    { name: q.name, first_name: firstName(q.name), email: q.email, summary: inquirySummary(q, packageName) },
    `${site.url}/admin/clients${q.client_id ? `/${q.client_id}` : ""}`
  );
}

export function inquiryAutoReply(q: Inquiry) {
  return renderEmail("inquiry_reply", { first_name: firstName(q.name), name: q.name });
}

export function galleryReadyEmail(input: {
  clientName: string;
  kind: "proof" | "final";
  link: string;
  code: string;
  expiresAt?: string | null;
}) {
  return renderEmail(
    input.kind === "proof" ? "gallery_proofs" : "gallery_final",
    { first_name: firstName(input.clientName), name: input.clientName, code: input.code, link: input.link },
    input.link
  );
}

export function paymentReceiptEmail(input: {
  clientName: string;
  orderNumber: number;
  title: string;
  amount: string;
  shootDate: string | null;
}) {
  return renderEmail("receipt", {
    first_name: firstName(input.clientName),
    name: input.clientName,
    amount: input.amount,
    title: input.title,
    order_number: String(input.orderNumber),
    shoot_date: input.shootDate ?? "",
  });
}

export function agreementEmail(input: {
  clientName: string;
  sections: ContractSection[];
  signedBy: string;
  portfolioOk: boolean;
  signedAt?: Date;
}) {
  const when = (input.signedAt ?? new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return renderEmail("agreement", {
    first_name: firstName(input.clientName),
    name: input.clientName,
    signed_date: when,
    agreement: formatAgreement(input.sections),
    signed_by: input.signedBy,
    portfolio_use: input.portfolioOk ? "allowed" : "not allowed",
  });
}
