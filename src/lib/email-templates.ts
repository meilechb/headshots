import { contractSections, type ContractSection } from "@/lib/contract";
import { site } from "@/lib/site";
import type { EmailKind } from "@/lib/email";

/**
 * The emails the site sends, as editable templates. Text uses {{placeholders}}
 * that are filled in when the email goes out. The defaults here are the
 * shipped wording; the studio can override subject, text and button label
 * (stored in site_settings, see lib/data/settings.ts). Pure module: the admin
 * preview runs it in the browser.
 */

export const templateKeys = [
  "inquiry_notice",
  "inquiry_reply",
  "gallery_proofs",
  "gallery_final",
  "receipt",
  "agreement",
] as const;

export type TemplateKey = (typeof templateKeys)[number];

/** The editable parts of a template. cta_label only applies when the template has a button. */
export type TemplateValues = { subject: string; body: string; cta_label?: string };

export type TemplateVariable = { name: string; description: string };

export type EmailTemplateDef = {
  key: TemplateKey;
  name: string;
  /** When it goes out, in plain words for the studio. */
  when: string;
  to: "the client" | "you";
  logKind: EmailKind;
  hasCta: boolean;
  defaults: TemplateValues;
  variables: TemplateVariable[];
  /** Realistic values for the preview and the test send. */
  sample: Record<string, string>;
  /** Button link used by the preview. */
  sampleCtaUrl?: string;
};

/** Available in every template. */
export const globalVariables: TemplateVariable[] = [
  { name: "site_name", description: "Your name as shown on the site" },
  { name: "site_email", description: "Your public email address" },
  { name: "site_url", description: "The site address" },
];

export function globalValues(): Record<string, string> {
  return { site_name: site.name, site_email: site.email, site_url: site.url };
}

const signature = "{{site_name}}\n{{site_email}}";

/** The agreement sections as plain text, the way the agreement email prints them. */
export function formatAgreement(sections: ContractSection[]) {
  return sections.map((s) => [s.heading.toUpperCase(), ...s.body].join("\n")).join("\n\n");
}

const sampleAgreement = formatAgreement(
  contractSections({
    clientName: "Sarah Cohen",
    title: "Individual headshot",
    shootDate: "2026-10-14",
    priceCents: 25000,
    depositCents: 10000,
    includedFinals: 3,
    extraFinalCents: 5000,
    currency: "usd",
  })
);

export const emailTemplates: EmailTemplateDef[] = [
  {
    key: "inquiry_notice",
    name: "New inquiry (to you)",
    when: "Sent to you the moment someone submits the contact form.",
    to: "you",
    logKind: "inquiry_notice",
    hasCta: true,
    defaults: {
      subject: "New inquiry: {{name}}",
      body: "{{summary}}\n\nReply to this email to answer {{first_name}} directly.",
      cta_label: "Open in the studio",
    },
    variables: [
      { name: "name", description: "Full name they entered" },
      { name: "first_name", description: "Their first name" },
      { name: "email", description: "Their email address" },
      { name: "summary", description: "Everything they filled in, one line each" },
    ],
    sample: {
      name: "Sarah Cohen",
      first_name: "Sarah",
      email: "sarah@example.com",
      summary:
        "Name: Sarah Cohen\nEmail: sarah@example.com\nPhone: (845) 555-0134\nSession: Headshot for myself (business / LinkedIn)\nWhere: At the studio\nTown: Monsey\nTiming: Sometime in the next two weeks\n\nMessage:\nHi, I need a new LinkedIn photo. What does a session look like?",
    },
    sampleCtaUrl: `${site.url}/admin/clients`,
  },
  {
    key: "inquiry_reply",
    name: "Inquiry reply",
    when: "Sent to the client right after they submit the contact form.",
    to: "the client",
    logKind: "inquiry_reply",
    hasCta: false,
    defaults: {
      subject: "Got your message, {{first_name}}",
      body: `Hi {{first_name}},\n\nGot your message. I reply within one business day.\n\n${signature}`,
    },
    variables: [
      { name: "first_name", description: "Their first name" },
      { name: "name", description: "Full name they entered" },
    ],
    sample: { first_name: "Sarah", name: "Sarah Cohen" },
  },
  {
    key: "gallery_proofs",
    name: "Proofs ready",
    when: "Sent when you press Email client on a live proof gallery.",
    to: "the client",
    logKind: "gallery_ready",
    hasCta: true,
    defaults: {
      subject: "Your proofs are ready: {{site_name}}",
      body: `Hi {{first_name}},\n\nYour proofs are ready.\nCode: {{code}}\n{{link}}\n\n${signature}`,
      cta_label: "See your proofs",
    },
    variables: [
      { name: "first_name", description: "Client's first name" },
      { name: "name", description: "Client's full name" },
      { name: "code", description: "Gallery access code" },
      { name: "link", description: "Gallery link" },
    ],
    sample: { first_name: "Sarah", name: "Sarah Cohen", code: "K7P2QX", link: `${site.url}/g/sarah-cohen-proofs` },
    sampleCtaUrl: `${site.url}/g/sarah-cohen-proofs`,
  },
  {
    key: "gallery_final",
    name: "Photos ready",
    when: "Sent when you press Email client on a live final gallery.",
    to: "the client",
    logKind: "gallery_ready",
    hasCta: true,
    defaults: {
      subject: "Your photos are ready: {{site_name}}",
      body: `Hi {{first_name}},\n\nYour photos are ready.\nCode: {{code}}\n{{link}}\n\n${signature}`,
      cta_label: "See your photos",
    },
    variables: [
      { name: "first_name", description: "Client's first name" },
      { name: "name", description: "Client's full name" },
      { name: "code", description: "Gallery access code" },
      { name: "link", description: "Gallery link" },
    ],
    sample: { first_name: "Sarah", name: "Sarah Cohen", code: "K7P2QX", link: `${site.url}/g/sarah-cohen` },
    sampleCtaUrl: `${site.url}/g/sarah-cohen`,
  },
  {
    key: "receipt",
    name: "Payment receipt",
    when: "Sent when a card payment goes through on the session page.",
    to: "the client",
    logKind: "receipt",
    hasCta: false,
    defaults: {
      subject: "Payment received: {{site_name}}",
      body: `Hi {{first_name}},\n\nPayment of {{amount}} received for {{title}}. Thank you.\n\n${signature}`,
    },
    variables: [
      { name: "first_name", description: "Client's first name" },
      { name: "name", description: "Client's full name" },
      { name: "amount", description: "Amount paid, formatted" },
      { name: "title", description: "Session title" },
      { name: "order_number", description: "Session number" },
      { name: "shoot_date", description: "Shoot date, or empty if not set" },
    ],
    sample: {
      first_name: "Sarah",
      name: "Sarah Cohen",
      amount: "$100.00",
      title: "Individual headshot",
      order_number: "1042",
      shoot_date: "2026-10-14",
    },
  },
  {
    key: "agreement",
    name: "Agreement copy",
    when: "Sent when the client signs the agreement on the session page.",
    to: "the client",
    logKind: "agreement",
    hasCta: false,
    defaults: {
      subject: "Your agreement: {{site_name}}",
      body: `Hi {{first_name}},\n\nHere is a copy of the agreement you signed on {{signed_date}}.\n\n{{agreement}}\n\nSigned by {{signed_by}}. Portfolio use: {{portfolio_use}}.\n\n${signature}`,
    },
    variables: [
      { name: "first_name", description: "Client's first name" },
      { name: "name", description: "Client's full name" },
      { name: "signed_date", description: "The day they signed" },
      { name: "agreement", description: "The full agreement text" },
      { name: "signed_by", description: "The name they typed" },
      { name: "portfolio_use", description: "\"allowed\" or \"not allowed\"" },
    ],
    sample: {
      first_name: "Sarah",
      name: "Sarah Cohen",
      signed_date: "October 1, 2026",
      agreement: sampleAgreement,
      signed_by: "Sarah Cohen",
      portfolio_use: "allowed",
    },
  },
];

export function getTemplate(key: string): EmailTemplateDef | undefined {
  return emailTemplates.find((t) => t.key === key);
}

/**
 * Replaces {{name}} placeholders. Unknown placeholders are left in place so a
 * typo shows up in the preview instead of silently disappearing.
 */
export function fillTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match
  );
}

/** Saved overrides merged over the shipped defaults. */
export function resolveValues(def: EmailTemplateDef, override?: Partial<TemplateValues> | null): TemplateValues {
  const values: TemplateValues = {
    subject: override?.subject?.trim() || def.defaults.subject,
    body: override?.body?.trim() || def.defaults.body,
  };
  if (def.hasCta) values.cta_label = override?.cta_label?.trim() || def.defaults.cta_label;
  return values;
}

export function sameAsDefaults(def: EmailTemplateDef, values: TemplateValues) {
  return (
    values.subject === def.defaults.subject &&
    values.body === def.defaults.body &&
    (!def.hasCta || values.cta_label === def.defaults.cta_label)
  );
}

/** Fills a template's subject, text and button for sending or previewing. */
export function renderValues(
  def: EmailTemplateDef,
  values: TemplateValues,
  vars: Record<string, string>,
  ctaUrl?: string | null
) {
  const all = { ...globalValues(), ...vars };
  const subject = fillTemplate(values.subject, all).replace(/\s+/g, " ").trim();
  const text = fillTemplate(values.body, all);
  const cta = def.hasCta && ctaUrl ? { label: fillTemplate(values.cta_label ?? "", all).trim() || "Open", url: ctaUrl } : undefined;
  return { subject, text, cta };
}
