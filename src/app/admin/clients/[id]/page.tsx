import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listPackages } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { formatMoney, galleryKindLabels, type ClientStage } from "@/lib/types";
import { GalleryStatusBadge, StageBadge, formatDate } from "@/components/admin/badges";
import { ActionForm, Field, SubmitButton } from "@/components/admin/form";
import { ConfirmSubmit, CopyButton } from "@/components/admin/ui";
import { MarkRead } from "@/components/admin/mark-read";
import { SessionForm } from "@/components/admin/session-form";
import {
  createGalleryForClient,
  createSession,
  deleteClient,
  deleteMessage,
  deleteSession,
  markSessionPaid,
  markSessionUnpaid,
  setClientArchived,
  updateClient,
  updateSession,
} from "../../actions";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, packages] = await Promise.all([getClient(id), listPackages()]);
  if (!data) notFound();
  const { client, messages, sessions, galleries } = data;

  const stage: ClientStage = client.archived
    ? "archived"
    : galleries.some((g) => g.kind === "final" && g.status === "published")
      ? "delivered"
      : galleries.some((g) => g.kind === "proof" && g.status === "published")
        ? "proofing"
        : sessions.some((s) => !["draft", "pending_payment", "cancelled"].includes(s.status))
          ? "booked"
          : sessions.some((s) => s.status === "pending_payment")
            ? "awaiting_payment"
            : "lead";

  const unread = messages.some((m) => m.status === "new");
  const packageName = (slug: string | null) =>
    slug ? packages.find((p) => p.slug === slug)?.name ?? slug : null;
  const firstName = client.name.split(" ")[0];
  const canDelete = sessions.length === 0 && galleries.length === 0;

  return (
    <div className="space-y-8">
      {unread ? <MarkRead clientId={client.id} /> : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/clients" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
            ← Clients
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl">{client.name}</h1>
            <StageBadge stage={stage} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <a href={`mailto:${client.email}`} className="underline hover:text-ink">{client.email}</a>
            {client.phone ? (
              <>
                {" · "}
                <a href={`tel:${client.phone}`} className="underline hover:text-ink">{client.phone}</a>
              </>
            ) : null}
            {client.company ? ` · ${client.company}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={setClientArchived.bind(null, client.id, !client.archived)}>
            <SubmitButton className="btn-secondary px-4 py-2" pendingLabel="…">
              {client.archived ? "Unarchive" : "Archive"}
            </SubmitButton>
          </form>
          {canDelete ? (
            <form action={deleteClient.bind(null, client.id)}>
              <ConfirmSubmit className="btn-danger px-4 py-2" message={`Delete ${client.name} and their messages?`}>
                Delete
              </ConfirmSubmit>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* Messages */}
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">Messages</h2>
              <a
                href={`mailto:${client.email}?subject=${encodeURIComponent(`Re: your headshot inquiry — ${site.name}`)}&body=${encodeURIComponent(`Hi ${firstName},\n\nThanks for getting in touch.\n\n`)}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                Reply by email
              </a>
            </div>
            {messages.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No messages from the contact form.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {messages.map((m) => (
                  <li key={m.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 text-xs text-muted">
                      <span>
                        {formatDate(m.created_at, true)}
                        {m.package_slug ? ` · interested in ${packageName(m.package_slug)}` : ""}
                        {m.status === "new" ? <span className="ml-2 text-brass-2">New</span> : null}
                      </span>
                      <form action={deleteMessage.bind(null, m.id)}>
                        <ConfirmSubmit className="text-muted hover:text-danger" message="Delete this message?">
                          Delete
                        </ConfirmSubmit>
                      </form>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm">
                      {m.message || <span className="text-muted">No message, just contact details.</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Sessions */}
          <section className="card p-5">
            <h2 className="font-medium">Sessions &amp; payment</h2>
            <p className="mt-1 text-xs text-muted">
              One session is one shoot with one price. Send the payment link; the client pays by card and it marks itself paid.
            </p>

            {sessions.length ? (
              <ul className="mt-4 space-y-4">
                {sessions.map((s) => {
                  const paid = Boolean(s.paid_at) || !["draft", "pending_payment", "cancelled"].includes(s.status);
                  const payUrl = `${site.url}/pay/${s.id}`;
                  return (
                    <li key={s.id} className="border border-line p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{s.title}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {s.package?.name ? `${s.package.name} · ` : ""}
                            {s.shoot_date ? `Shoot ${formatDate(s.shoot_date, true)}` : "No shoot date yet"}
                            {" · #"}{s.order_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl">{formatMoney(s.amount_cents, s.currency)}</p>
                          <p className={`text-xs ${paid ? "text-success" : "text-brass-2"}`}>
                            {paid ? `Paid ${s.paid_at ? formatDate(s.paid_at, true) : ""}` : "Awaiting payment"}
                          </p>
                        </div>
                      </div>

                      {!paid ? (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="min-w-0 flex-1 truncate border border-line bg-paper-2 px-3 py-2 text-xs">{payUrl}</code>
                            <CopyButton value={payUrl} label="Copy link" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`mailto:${client.email}?subject=${encodeURIComponent(`Payment for your headshot session — ${site.name}`)}&body=${encodeURIComponent(`Hi ${firstName},\n\nHere is the secure payment link for your session (${formatMoney(s.amount_cents, s.currency)}):\n${payUrl}\n\nThank you,\n${site.name}`)}`}
                              className="btn-primary px-3 py-1.5 text-xs"
                            >
                              Email payment link
                            </a>
                            <form action={markSessionPaid.bind(null, s.id)}>
                              <SubmitButton className="btn-secondary px-3 py-1.5 text-xs" pendingLabel="Saving…">
                                Mark paid (cash / Zelle)
                              </SubmitButton>
                            </form>
                          </div>
                        </div>
                      ) : !s.stripe_payment_intent_id ? (
                        <form action={markSessionUnpaid.bind(null, s.id)} className="mt-3">
                          <SubmitButton className="text-xs text-muted underline hover:text-ink" pendingLabel="…">
                            Undo mark paid
                          </SubmitButton>
                        </form>
                      ) : null}

                      <details className="mt-4 text-sm">
                        <summary className="cursor-pointer text-xs text-muted hover:text-ink">Edit session</summary>
                        <ActionForm
                          key={s.updated_at}
                          action={updateSession.bind(null, s.id)}
                          className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2"
                          extra={
                            <ConfirmSubmit
                              className="btn-danger px-3 py-1.5 text-xs"
                              message="Delete this session? Galleries stay."
                              formAction={deleteSession.bind(null, s.id)}
                            >
                              Delete session
                            </ConfirmSubmit>
                          }
                        >
                          <Field label="Title" htmlFor={`title-${s.id}`}>
                            <input id={`title-${s.id}`} name="title" defaultValue={s.title} required className="input" />
                          </Field>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Price" htmlFor={`amount-${s.id}`} hint="USD">
                              <input id={`amount-${s.id}`} name="amount" inputMode="decimal" defaultValue={(s.amount_cents / 100).toFixed(2)} className="input" />
                            </Field>
                            <Field label="Shoot date" htmlFor={`date-${s.id}`}>
                              <input id={`date-${s.id}`} name="shoot_date" type="date" defaultValue={s.shoot_date ?? ""} className="input" />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Note to client" htmlFor={`description-${s.id}`} hint="shown on the payment page">
                              <textarea id={`description-${s.id}`} name="description" rows={2} defaultValue={s.description ?? ""} className="input" />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Private notes" htmlFor={`notes-${s.id}`}>
                              <textarea id={`notes-${s.id}`} name="notes" rows={2} defaultValue={s.notes ?? ""} className="input" />
                            </Field>
                          </div>
                        </ActionForm>
                      </details>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <details className="mt-4" open={sessions.length === 0}>
              <summary className="cursor-pointer text-sm font-medium hover:text-brass-2">
                {sessions.length ? "Add another session" : "Set up a session"}
              </summary>
              <div className="mt-4">
                <SessionForm action={createSession.bind(null, client.id)} packages={packages} />
              </div>
            </details>
          </section>

          {/* Galleries */}
          <section className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium">Galleries</h2>
              <div className="flex gap-2">
                <form action={createGalleryForClient.bind(null, client.id, "proof")}>
                  <SubmitButton className="btn-secondary px-3 py-1.5 text-xs" pendingLabel="Creating…">
                    New proofs gallery
                  </SubmitButton>
                </form>
                <form action={createGalleryForClient.bind(null, client.id, "final")}>
                  <SubmitButton className="btn-secondary px-3 py-1.5 text-xs" pendingLabel="Creating…">
                    New final gallery
                  </SubmitButton>
                </form>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted">
              Proofs: the client marks favorites and leaves notes. Final: the client downloads the retouched files.
            </p>
            {galleries.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No galleries yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line text-sm">
                {galleries.map((g) => (
                  <li key={g.id} className="py-3 first:pt-0 last:pb-0">
                    <Link href={`/admin/galleries/${g.id}`} className="flex flex-wrap items-center justify-between gap-3 hover:text-brass-2">
                      <span className="min-w-0">
                        <span className="block font-medium">{g.title}</span>
                        <span className="block text-xs text-muted">
                          {galleryKindLabels[g.kind]} · {g.photo_count} photo{g.photo_count === 1 ? "" : "s"}
                          {g.favorites ? ` · ${g.favorites} favorite${g.favorites === 1 ? "" : "s"}` : ""}
                          {g.open_notes ? ` · ${g.open_notes} open note${g.open_notes === 1 ? "" : "s"}` : ""}
                        </span>
                      </span>
                      <GalleryStatusBadge status={g.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Details */}
        <ActionForm
          key={`${client.name}-${client.email}-${client.phone}-${client.company}`}
          action={updateClient.bind(null, client.id)}
          className="card h-fit space-y-4 p-5"
        >
          <h2 className="font-medium">Details</h2>
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" defaultValue={client.name} required className="input" />
          </Field>
          <Field label="Email" htmlFor="email">
            <input id="email" name="email" type="email" defaultValue={client.email} required className="input" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ""} className="input" />
            </Field>
            <Field label="Company" htmlFor="company">
              <input id="company" name="company" defaultValue={client.company ?? ""} className="input" />
            </Field>
          </div>
          <Field label="Private notes" htmlFor="notes" hint="only you see these">
            <textarea id="notes" name="notes" rows={5} defaultValue={client.notes ?? ""} className="input" />
          </Field>
        </ActionForm>
      </div>
    </div>
  );
}
