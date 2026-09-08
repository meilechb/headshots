import "server-only";

import { db, dbConfigured } from "@/lib/db";
import { emailLayout } from "@/lib/email-layout";
import { site } from "@/lib/site";

export { emailLayout, textToHtml } from "@/lib/email-layout";

/**
 * Transactional email through Resend's HTTP API (POST https://api.resend.com/emails,
 * bearer token). Optional: when RESEND_API_KEY is missing every send returns
 * { ok: false, skipped: true } and callers fall back to mailto links.
 * Every attempt is written to email_log so the studio can see what went out.
 */

export type SendResult = { ok: boolean; skipped?: boolean; error?: string; id?: string };

export type EmailKind =
  | "inquiry_notice"
  | "inquiry_reply"
  | "gallery_ready"
  | "receipt"
  | "agreement"
  | "test";

export const emailKindLabels: Record<EmailKind, string> = {
  inquiry_notice: "New inquiry (to you)",
  inquiry_reply: "Inquiry reply",
  gallery_ready: "Gallery ready",
  receipt: "Receipt",
  agreement: "Agreement copy",
  test: "Test",
};

export function fromAddress() {
  return process.env.EMAIL_FROM?.trim() || `${site.name} <${site.email}>`;
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function notifyAddress() {
  return process.env.INQUIRY_NOTIFY_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || site.email;
}

export type EmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  /** Optional button rendered under the text in the HTML version. */
  cta?: { label: string; url: string };
  kind?: EmailKind;
};

export async function sendEmail(input: EmailInput): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const result = key ? await deliver(key, input) : { ok: false, skipped: true, error: "RESEND_API_KEY is not set" };
  await log(input, result);
  return result;
}

async function deliver(key: string, input: EmailInput): Promise<SendResult> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? emailLayout(input.text, input.cta),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend error", res.status, body);
      let message = `Email service returned ${res.status}`;
      try {
        const parsed = JSON.parse(body) as { message?: string };
        if (parsed.message) message = parsed.message;
      } catch {
        // keep the status message
      }
      return { ok: false, error: message };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("Resend request failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Email request failed" };
  }
}

async function log(input: EmailInput, result: SendResult) {
  if (!dbConfigured()) return;
  try {
    const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;
    await db()`
      insert into email_log (kind, to_address, subject, status, error, provider_id)
      values (${input.kind ?? null}, ${to}, ${input.subject},
              ${result.ok ? "sent" : result.skipped ? "skipped" : "failed"},
              ${result.ok ? null : (result.error ?? null)}, ${result.id ?? null})`;
  } catch (error) {
    console.error("email_log insert failed", error);
  }
}
