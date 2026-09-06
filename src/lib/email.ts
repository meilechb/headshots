import "server-only";

import { site } from "@/lib/site";

/**
 * Transactional email through Resend's HTTP API (POST https://api.resend.com/emails,
 * bearer token). Optional: when RESEND_API_KEY is missing every send returns
 * { ok: false, skipped: true } and callers fall back to mailto links.
 */

export type SendResult = { ok: boolean; skipped?: boolean; error?: string; id?: string };

function fromAddress() {
  return process.env.EMAIL_FROM?.trim() || `${site.name} <${site.email}>`;
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function notifyAddress() {
  return process.env.INQUIRY_NOTIFY_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || site.email;
}

export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, skipped: true, error: "RESEND_API_KEY is not set" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html ?? textToHtml(input.text),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("Resend error", res.status, body);
      return { ok: false, error: `Email service returned ${res.status}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("Resend request failed", error);
    return { ok: false, error: error instanceof Error ? error.message : "Email request failed" };
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Plain text → simple HTML: paragraphs, line breaks, clickable links. */
export function textToHtml(text: string) {
  const paragraphs = text.trim().split(/\n{2,}/).map((p) => {
    const withLinks = escapeHtml(p).replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color:#111">$1</a>'
    );
    return `<p style="margin:0 0 16px;line-height:1.55">${withLinks.replace(/\n/g, "<br>")}</p>`;
  });
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;color:#111;max-width:600px">${paragraphs.join("")}</div>`;
}
