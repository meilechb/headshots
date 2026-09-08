import { site } from "@/lib/site";

/**
 * The one email design, as pure functions so the studio can preview templates
 * in the browser exactly as they are sent. Server code imports these through
 * lib/email.ts.
 */

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Plain text → paragraphs with line breaks and clickable links. */
export function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => {
      const withLinks = escapeHtml(p).replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" style="color:#0d0d0e;text-decoration:underline">$1</a>'
      );
      return `<p style="margin:0 0 16px;line-height:1.6">${withLinks.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

/**
 * Light card, wordmark, the text, an optional button, a quiet footer.
 * Inline styles only so every mail app renders it the same.
 */
export function emailLayout(text: string, cta?: { label: string; url: string }) {
  const button = cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px"><tr><td style="background:#0d0d0e;border-radius:999px">
         <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:600;text-decoration:none;font-size:15px">${escapeHtml(cta.label)}</a>
       </td></tr></table>`
    : "";
  const host = site.url.replace(/^https?:\/\//, "");
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f4">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f4;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:#0d0d0e">
<tr><td style="padding-bottom:24px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0d0d0e">${escapeHtml(site.name)}</td></tr>
<tr><td>${textToHtml(text)}${button}</td></tr>
<tr><td style="border-top:1px solid #e7e7e5;padding-top:16px;font-size:12px;line-height:1.6;color:#86868b">
<a href="${site.url}" style="color:#86868b;text-decoration:none">${escapeHtml(host)}</a> · <a href="mailto:${site.email}" style="color:#86868b;text-decoration:none">${escapeHtml(site.email)}</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
