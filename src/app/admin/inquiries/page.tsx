import { listInquiries } from "@/lib/data/admin";
import { ConfirmSubmit } from "@/components/admin/ui";
import { convertInquiryToClient, deleteInquiry, updateInquiryStatus } from "../actions";

const statuses = ["new", "contacted", "booked", "closed"] as const;

export default async function InquiriesPage() {
  const inquiries = await listInquiries();

  return (
    <div>
      <p className="eyebrow">Leads</p>
      <h1 className="mt-2 font-display text-3xl">Inquiries</h1>
      <p className="mt-2 text-sm text-muted">
        Messages from the contact form. Convert a lead to a client to start an order.
      </p>

      {inquiries.length === 0 ? (
        <p className="card mt-8 p-6 text-sm text-muted">No inquiries yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {inquiries.map((q) => (
            <li key={q.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium">
                    {q.name}{" "}
                    <span className={`badge ml-2 ${q.status === "new" ? "border-brass/40 text-brass-2" : "border-line text-muted"}`}>
                      {q.status}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <a href={`mailto:${q.email}`} className="underline">{q.email}</a>
                    {q.phone ? ` · ${q.phone}` : ""}
                    {q.package_slug ? ` · interested in ${q.package_slug}` : ""}
                    {" · "}
                    {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {q.message ? (
                    <p className="mt-3 whitespace-pre-line text-sm">{q.message}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form key={q.status} action={updateInquiryStatus.bind(null, q.id)} className="flex items-center gap-2">
                    <select name="status" defaultValue={q.status} className="input w-auto py-1.5 text-xs">
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Save</button>
                  </form>
                  <form action={convertInquiryToClient.bind(null, q.id)}>
                    <button type="submit" className="btn-primary px-3 py-1.5 text-xs">
                      Make client
                    </button>
                  </form>
                  <form action={deleteInquiry.bind(null, q.id)}>
                    <ConfirmSubmit className="btn-danger px-3 py-1.5 text-xs" message="Delete this inquiry?">
                      Delete
                    </ConfirmSubmit>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
