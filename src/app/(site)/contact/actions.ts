"use server";

import { db } from "@/lib/db";

export type InquiryValues = { name: string; email: string; phone: string; package: string; message: string };
export type InquiryState = { ok?: boolean; error?: string; values?: InquiryValues };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  // Honeypot: real users never fill this.
  if (String(formData.get("website") ?? "").length > 0) {
    return { ok: true };
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 40);
  const packageSlug = String(formData.get("package") ?? "").trim().slice(0, 60);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);

  const values: InquiryValues = { name, email, phone, package: packageSlug, message };
  if (!name) return { error: "Please tell me your name.", values };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email.", values };

  try {
    await db()`
      insert into inquiries (name, email, phone, package_slug, message)
      values (${name}, ${email}, ${phone || null}, ${packageSlug || null}, ${message || null})`;
  } catch {
    return {
      error:
        "Something went wrong sending your message. Email me directly and I’ll reply the same day.",
      values,
    };
  }

  return { ok: true };
}
