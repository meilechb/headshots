"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type InquiryState = { ok?: boolean; error?: string };

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

  if (!name) return { error: "Please tell me your name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone: phone || null,
      package_slug: packageSlug || null,
      message: message || null,
    });
    if (error) throw error;
  } catch {
    return {
      error:
        "Something went wrong sending your message. Email me directly and I’ll reply the same day.",
    };
  }

  return { ok: true };
}
