import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, listPackages } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { labelLocation, labelSessionType } from "@/lib/emails";
import { formatMoney, galleryKindLabels, type ClientStage } from "@/lib/types";
import { GalleryStatusBadge, StageBadge, formatDate } from "@/components/admin/badges";
import { ActionForm, Disclosure, Field, SubmitButton } from "@/components/admin/form";
import { Icon } from "@/components/admin/icons";
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
  const replyHref = `mailto:${client.email}?subject=${encodeURIComponent(`Your headshots: ${site.name}`)}&body=${encodeURIComponent(`Hi ${firstName},\n\n`)}`;

  return (
    <div className="space-y-6">
      {unread ? <MarkRead clientId={client.id} /> : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/clients" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
            ← Clients
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
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
        <a href={replyHref} className="btn-primary"><Icon name="mail" />Email</a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Disclosure
          label={<><Icon name="pencil" />Edit details</>}
          openLabel={<><Icon name="pencil" />Edit details</>}
          className="btn-ghost"
          openClassName="btn-secondary"
        >
          <ActionForm
            key={`${client.name}-${client.email}-${client.phone}-${client.company}-${client.notes}`}
            action={updateClient.bind(null, client.id)}
            className="card mt-2 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
          >
            <Field label="Name" htmlFor="name">
              <input id="name" name="name" defaultValue={client.name} required className="input" />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={client.email} required className="input" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ""} className="input" />
            </Field>
            <Field label="Company" htmlFor="company">
              <input id="company" name="company" defaultValue={client.company ?? ""} className="input" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes" htmlFor="notes">
                <textarea id="notes" name="notes" rows={3} defaultValue={client.notes ?? ""} className="input" />
              </Field>
            </div>
          </ActionForm>
        </Disclosure>
        <form action={setClientArchived.bind(null, client.id, !client.archived)}>
          <SubmitButton className="btn-ghost" pendingLabel="…">
            <Icon name="archive" />
            {client.archived ? "Unarchive" : "Archive"}
          </SubmitButton>
        </form>
        {canDelete ? (
          <form action={deleteClient.bind(null, client.id)} className="ml-auto">
            <ConfirmSubmit className="btn-danger" message={`Delete ${client.name}?`}>
              <Icon name="trash" />
              Delete
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>

      {messages.length ? (
        <section className="card p-4">
          <h2 className="font-medium">Messages</h2>
          <ul className="mt-3 divide-y divide-line">
            {messages.map((m) => {
              const facts = [
                m.session_type ? labelSessionType(m.session_type) : null,
                m.people_count ? `${m.people_count} people` : null,
                m.location_pref ? labelLocation(m.location_pref) : null,
                m.town,
                packageName(m.package_slug),
                m.timing,
                m.source,
              ].filter(Boolean);
              return (
                <li key={m.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3 text-xs text-muted">
                    <span>
                      {formatDate(m.created_at, true)}
                      {m.status === "new" ? <span className="ml-2 text-brass-2">New</span> : null}
                      {facts.length ? ` · ${facts.join(" · ")}` : ""}
                    </span>
                    <form action={deleteMessage.bind(null, m.id)}>
                      <ConfirmSubmit className="btn-danger h-8 px-3 text-xs" message="Delete this message?">
                        <Icon name="trash" />
                        Delete
                      </ConfirmSubmit>
                    </form>
                  </div>
                  {m.message ? <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Sessions</h2>
          <Disclosure label={<><Icon name="plus" />Add session</>}>
            <div className="mt-3 border border-line p-3">
              <SessionForm action={createSession.bind(null, client.id)} packages={packages} />
            </div>
          </Disclosure>
        </div>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No sessions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {sessions.map((s) => {
              const m = s.money;
              const payUrl = `${site.url}/pay/${s.id}`;
              const payMail = `mailto:${client.email}?subject=${encodeURIComponent(`${s.title}: ${site.name}`)}&body=${encodeURIComponent(`Hi ${firstName},\n\nHere is your session page:\n${payUrl}\n\n${site.name}`)}`;
              const hasManual = s.payments.some((p) => p.method === "manual" && p.status === "paid");
              const status = m.fully_paid
                ? "Paid in full"
                : m.deposit_paid
                  ? `Deposit paid · ${formatMoney(m.due_cents, s.currency)} due`
                  : `Not paid · deposit ${formatMoney(m.deposit_due_cents, s.currency)}`;
              return (
                <li key={s.id} className="py-4 first:pt-3 last:pb-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium">{s.title}</span>
                    <span className="font-display text-lg">{formatMoney(m.total_cents, s.currency)}</span>
                    <span className={`text-xs ${m.fully_paid ? "text-success" : "text-brass-2"}`}>{status}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {s.shoot_date ? formatDate(s.shoot_date, true) : "No date"} · #{s.order_number}
                    {m.extra_picks ? ` · ${m.extra_picks} extra photo${m.extra_picks === 1 ? "" : "s"}` : ""}
                    {" · "}
                    {s.contract_signed_at ? `Agreement signed ${formatDate(s.contract_signed_at, true)}` : "Agreement not signed"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!m.fully_paid && !m.deposit_paid ? (
                      <form action={markSessionPaid.bind(null, s.id, "deposit")}>
                        <SubmitButton className="btn-secondary" pendingLabel="…"><Icon name="dollar" />Deposit paid</SubmitButton>
                      </form>
                    ) : null}
                    {!m.fully_paid ? (
                      <form action={markSessionPaid.bind(null, s.id, "balance")}>
                        <SubmitButton className="btn-secondary" pendingLabel="…"><Icon name="dollar" />Balance paid</SubmitButton>
                      </form>
                    ) : null}
                    <CopyButton value={payUrl} label="Copy link" />
                    <a href={payMail} className="btn-ghost"><Icon name="mail" />Email link</a>
                    {hasManual ? (
                      <form action={markSessionUnpaid.bind(null, s.id)}>
                        <SubmitButton className="btn-ghost" pendingLabel="…"><Icon name="undo" />Undo payment</SubmitButton>
                      </form>
                    ) : null}
                    <Disclosure
                      label={<><Icon name="pencil" />Edit</>}
                      openLabel={<><Icon name="pencil" />Edit</>}
                      className="btn-ghost"
                      openClassName="btn-secondary"
                    >
                      <ActionForm
                        key={s.updated_at}
                        action={updateSession.bind(null, s.id)}
                        className="mt-2 grid grid-cols-2 gap-4 border border-line p-4 sm:grid-cols-3"
                        extra={
                          <ConfirmSubmit
                            className="btn-danger ml-auto"
                            message="Delete this session?"
                            formAction={deleteSession.bind(null, s.id)}
                          >
                            <Icon name="trash" />
                            Delete
                          </ConfirmSubmit>
                        }
                      >
                        <div className="col-span-2 sm:col-span-3">
                          <Field label="Title" htmlFor={`title-${s.id}`}>
                            <input id={`title-${s.id}`} name="title" defaultValue={s.title} required className="input" />
                          </Field>
                        </div>
                        <Field label="Price" htmlFor={`amount-${s.id}`}>
                          <input id={`amount-${s.id}`} name="amount" inputMode="decimal" defaultValue={(s.amount_cents / 100).toFixed(2)} className="input" />
                        </Field>
                        <Field label="Deposit" htmlFor={`deposit-${s.id}`}>
                          <input id={`deposit-${s.id}`} name="deposit" inputMode="decimal" defaultValue={(s.deposit_cents / 100).toFixed(2)} className="input" />
                        </Field>
                        <Field label="Shoot date" htmlFor={`date-${s.id}`}>
                          <input id={`date-${s.id}`} name="shoot_date" type="date" defaultValue={s.shoot_date ?? ""} className="input" />
                        </Field>
                        <Field label="Finals included" htmlFor={`finals-${s.id}`}>
                          <input id={`finals-${s.id}`} name="included_finals" type="number" min={0} defaultValue={s.included_finals} className="input" />
                        </Field>
                        <Field label="Extra photo" htmlFor={`extra-${s.id}`}>
                          <input id={`extra-${s.id}`} name="extra_final" inputMode="decimal" defaultValue={(s.extra_final_cents / 100).toFixed(2)} className="input" />
                        </Field>
                        <div className="col-span-2 sm:col-span-3">
                          <Field label="Note to client" htmlFor={`description-${s.id}`}>
                            <input id={`description-${s.id}`} name="description" defaultValue={s.description ?? ""} className="input" />
                          </Field>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <Field label="Notes" htmlFor={`notes-${s.id}`}>
                            <input id={`notes-${s.id}`} name="notes" defaultValue={s.notes ?? ""} className="input" />
                          </Field>
                        </div>
                      </ActionForm>
                    </Disclosure>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">Galleries</h2>
          <div className="flex flex-wrap gap-2">
            <form action={createGalleryForClient.bind(null, client.id, "proof")}>
              <SubmitButton className="btn-secondary" pendingLabel="…"><Icon name="plus" />Proofs</SubmitButton>
            </form>
            <form action={createGalleryForClient.bind(null, client.id, "final")}>
              <SubmitButton className="btn-secondary" pendingLabel="…"><Icon name="plus" />Finals</SubmitButton>
            </form>
          </div>
        </div>
        {galleries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No galleries yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {galleries.map((g) => (
              <li key={g.id} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/admin/galleries/${g.id}`} className="flex flex-wrap items-center justify-between gap-3 hover:text-brass-2">
                  <span className="min-w-0">
                    <span className="block font-medium">{g.title}</span>
                    <span className="block text-xs text-muted">
                      {galleryKindLabels[g.kind]} · {g.photo_count} photo{g.photo_count === 1 ? "" : "s"}
                      {g.favorites ? ` · ${g.favorites} favorite${g.favorites === 1 ? "" : "s"}` : ""}
                      {g.open_notes ? ` · ${g.open_notes} note${g.open_notes === 1 ? "" : "s"}` : ""}
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
  );
}
