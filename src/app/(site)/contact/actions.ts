"use server";

import { revalidatePath } from "next/cache";
import { db, one } from "@/lib/db";

export type InquiryValues = { name: string; email: string; phone: string; package: string; message: string };
export type InquiryState = { ok?: boolean; error?: string; values?: InquiryValues };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form → CRM. The sender becomes a client (or is matched to an
 * existing one by email) and the message is stored on that client.
 */
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
    const existing = one<{ id: string }>(
      await db()`select id from clients where lower(email) = lower(${email}) limit 1`
    );
    let clientId = existing?.id;
    if (clientId) {
      // A returning client: keep a phone number we didn't have and bring them back from the archive.
      await db()`
        update clients
        set phone = coalesce(phone, ${phone || null}), archived = false
        where id = ${clientId}`;
    } else {
      const created = one<{ id: string }>(
        await db()`
          insert into clients (name, email, phone)
          values (${name}, ${email}, ${phone || null})
          returning id`
      );
      clientId = created!.id;
    }
    await db()`
      insert into inquiries (client_id, name, email, phone, package_slug, message)
      values (${clientId}, ${name}, ${email}, ${phone || null}, ${packageSlug || null}, ${message || null})`;
  } catch {
    return {
      error:
        "Something went wrong sending your message. Email me directly and I’ll reply the same day.",
      values,
    };
  }

  revalidatePath("/admin/clients");
  return { ok: true };
}
