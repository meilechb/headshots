import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/ui";
import { listInquiries } from "@/lib/data/admin";
import { db, rows } from "@/lib/db";
import { emailConfigured } from "@/lib/email";
import { labelLocation, labelSessionType } from "@/lib/emails";
import { site } from "@/lib/site";
import type { InquiryStatus } from "@/lib/types";
import {
  convertInquiryToClient,
  deleteInquiry,
  setInquiryStatus,
  updateInquiryNotes,
} from "../actions";

export const metadata = { title: "Inquiries" };

const statuses: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Replied" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
];

function replyMailto(q: { name: string; email: string; session_type: string | null; timing: string | null }) {
  const first = q.name.split(" ")[0];
  const subject = `Your headshot session — ${site.name}`;
  const body = `Hi ${first},

Thanks for your message about ${labelSessionType(q.session_type).toLowerCase()}.

I have the following dates open${q.timing ? ` (you mentioned: ${q.timing})` : ""}:
- 
- 

Pricing is on ${site.url}/pricing. Once you pick a date I send a payment link to hold it, plus a short note on what to wear.

${site.name}
${site.url}`;
  return `mailto:${q.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = statuses.some((s) => s.value === status) ? (status as InquiryStatus) : null;
  const [all, clientRows] = await Promise.all([
    listInquiries(),
    db()`select id, lower(email) as email from clients`,
  ]);
  const clientByEmail = new Map(rows<{ id: string; email: string }>(clientRows).map((c) => [c.email, c.id]));
  const inquiries = filter ? all.filter((q) => q.status === filter) : all.filter((q) => q.status !== "closed");
  const counts = Object.fromEntries(statuses.map((s) => [s.value, all.filter((q) => q.status === s.value).length]));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Inquiries</h1>
          <p className="mt-2 text-sm text-muted">
            Messages from the contact form.{" "}
            {emailConfigured()
              ? "Each one was also emailed to you, and the sender got an automatic confirmation."
              : "Email sending is not set up, so check here for new messages."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/inquiries"
          className={`border px-3 py-2 text-xs uppercase tracking-[0.06em] ${!filter ? "border-ink bg-ink text-paper" : "border-line text-ink-2"}`}
        >
          Open
        </Link>
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={`/admin/inquiries?status=${s.value}`}
            className={`border px-3 py-2 text-xs uppercase tracking-[0.06em] ${filter === s.value ? "border-ink bg-ink text-paper" : "border-line text-ink-2"}`}
          >
            {s.label} ({counts[s.value]})
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-muted">Nothing here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {inquiries.map((q) => {
            const clientId = clientByEmail.get(q.email.toLowerCase());
            return (
              <li key={q.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {q.name}
                      <span className={`badge ${q.status === "new" ? "border-success/40 text-success" : "border-line text-muted"}`}>
                        {statuses.find((s) => s.value === q.status)?.label ?? q.status}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      <a href={`mailto:${q.email}`} className="underline">{q.email}</a>
                      {q.phone ? (
                        <>
                          {" · "}
                          <a href={`tel:${q.phone.replace(/[^+\d]/g, "")}`} className="underline">{q.phone}</a>
                        </>
                      ) : null}
                      {" · "}
                      {new Date(q.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={replyMailto(q)} className="btn-primary px-3 py-2 text-xs">Reply by email</a>
                    {clientId ? (
                      <>
                        <Link href={`/admin/clients/${clientId}`} className="btn-secondary px-3 py-2 text-xs">Client</Link>
                        <Link href={`/admin/orders/new?client=${clientId}`} className="btn-secondary px-3 py-2 text-xs">New order</Link>
                      </>
                    ) : (
                      <form action={convertInquiryToClient.bind(null, q.id)}>
                        <button type="submit" className="btn-secondary px-3 py-2 text-xs">Make client</button>
                      </form>
                    )}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Session</dt><dd>{labelSessionType(q.session_type)}{q.people_count ? ` · ${q.people_count} people` : ""}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Where</dt><dd>{labelLocation(q.location_pref)}{q.town ? ` · ${q.town}` : ""}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Package</dt><dd>{q.package_slug ?? "Not chosen"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Timing</dt><dd>{q.timing ?? "—"}</dd></div>
                  <div><dt className="text-xs uppercase tracking-wider text-muted">Heard about you</dt><dd>{q.source ?? "—"}</dd></div>
                </dl>
                {q.message ? <p className="mt-4 whitespace-pre-line border-l-2 border-line pl-3 text-sm">{q.message}</p> : null}

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
                  <form key={q.updated_at} action={updateInquiryNotes.bind(null, q.id)} className="flex gap-2">
                    <input
                      name="notes"
                      defaultValue={q.notes ?? ""}
                      placeholder="Private note (dates offered, quoted price…)"
                      className="input py-2 text-sm"
                    />
                    <button type="submit" className="btn-secondary shrink-0 px-3 py-2 text-xs">Save</button>
                  </form>
                  <div className="flex flex-wrap items-center gap-2">
                    {statuses
                      .filter((s) => s.value !== q.status)
                      .map((s) => (
                        <form key={s.value} action={setInquiryStatus.bind(null, q.id, s.value)}>
                          <button type="submit" className="btn-ghost px-3 py-2 text-xs">Mark {s.label.toLowerCase()}</button>
                        </form>
                      ))}
                    <form action={deleteInquiry.bind(null, q.id)}>
                      <ConfirmSubmit className="btn-danger px-3 py-2 text-xs" message="Delete this inquiry?">Delete</ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
