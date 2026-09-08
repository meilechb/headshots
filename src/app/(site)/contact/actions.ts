"use server";

import { revalidatePath } from "next/cache";
import { GA_EVENTS } from "@/lib/analytics";
import { sendServerEvent } from "@/lib/analytics-server";
import { db, one } from "@/lib/db";
import { notifyAddress, sendEmail } from "@/lib/email";
import { inquiryAutoReply, inquiryNotification } from "@/lib/emails";
import { locationPrefs, sessionTypes, type Inquiry } from "@/lib/types";

export type InquiryValues = {
  name: string;
  email: string;
  phone: string;
  session_type: string;
  people_count: string;
  package: string;
  location_pref: string;
  town: string;
  timing: string;
  message: string;
  source: string;
};
export type InquiryState = { ok?: boolean; error?: string; values?: InquiryValues; emailed?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field = (fd: FormData, k: string, max = 200) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real users never fill this.
  if (String(formData.get("website") ?? "").length > 0) return { ok: true };

  const values: InquiryValues = {
    name: field(formData, "name", 120),
    email: field(formData, "email", 200),
    phone: field(formData, "phone", 40),
    session_type: field(formData, "session_type", 40),
    people_count: field(formData, "people_count", 6),
    package: field(formData, "package", 60),
    location_pref: field(formData, "location_pref", 20),
    town: field(formData, "town", 80),
    timing: field(formData, "timing", 200),
    message: field(formData, "message", 4000),
    source: field(formData, "source", 120),
  };

  if (!values.name) return { error: "Please enter your name.", values };
  if (!EMAIL_RE.test(values.email)) return { error: "Please enter a valid email address.", values };
  const sessionType = sessionTypes.some((s) => s.value === values.session_type) ? values.session_type : null;
  const people = values.people_count ? Number.parseInt(values.people_count, 10) : null;
  if (values.people_count && (!Number.isFinite(people) || people! < 1 || people! > 5000)) {
    return { error: "Please enter how many people need photos.", values };
  }
  const location = locationPrefs.some((l) => l.value === values.location_pref) ? values.location_pref : null;

  // The sender becomes a client (or is matched to an existing one by email)
  // and the message is filed under them, so it shows up in the studio's client list.
  let inquiry: Inquiry | null = null;
  try {
    const existing = one<{ id: string }>(
      await db()`select id from clients where lower(email) = lower(${values.email}) limit 1`
    );
    let clientId = existing?.id;
    if (clientId) {
      await db()`
        update clients
        set phone = coalesce(phone, ${values.phone || null}), archived = false
        where id = ${clientId}`;
    } else {
      const created = one<{ id: string }>(
        await db()`
          insert into clients (name, email, phone)
          values (${values.name}, ${values.email}, ${values.phone || null})
          returning id`
      );
      clientId = created!.id;
    }
    inquiry = one<Inquiry>(
      await db()`
        insert into inquiries (client_id, name, email, phone, package_slug, message, session_type, people_count, location_pref, town, timing, source)
        values (${clientId}, ${values.name}, ${values.email}, ${values.phone || null}, ${values.package || null}, ${values.message || null},
                ${sessionType}, ${people}, ${location}, ${values.town || null}, ${values.timing || null}, ${values.source || null})
        returning *`
    );
  } catch (error) {
    console.error("inquiry insert failed", error);
    return {
      error: "Something went wrong sending your message. Please email me directly and I will reply the same day.",
      values,
    };
  }
  revalidatePath("/admin/clients");

  // Best effort: the inquiry is saved even if email or analytics is not configured or fails.
  let emailed = false;
  if (inquiry) {
    const packageName = values.package
      ? (one<{ name: string }>(await db()`select name from packages where slug = ${values.package} limit 1`)?.name ?? null)
      : null;
    const notice = inquiryNotification(inquiry, packageName);
    const reply = inquiryAutoReply(inquiry);
    const [a, b] = await Promise.all([
      sendEmail({ to: notifyAddress(), subject: notice.subject, text: notice.text, cta: notice.cta, replyTo: inquiry.email, kind: "inquiry_notice" }),
      sendEmail({ to: inquiry.email, subject: reply.subject, text: reply.text, kind: "inquiry_reply" }),
      // GA4 conversion. Runs only here, after the database write, so the honeypot
      // early return above never counts as a lead.
      sendServerEvent(GA_EVENTS.generateLead, {
        lead_source: (values.source || "contact_form").slice(0, 100),
        ...(sessionType ? { session_type: sessionType } : {}),
        ...(values.package ? { package: values.package } : {}),
      }),
    ]);
    emailed = a.ok && b.ok;
  }

  return { ok: true, emailed };
}
