import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/data/admin";
import { formatMoney, orderStatusLabels } from "@/lib/types";
import { ConfirmSubmit } from "@/components/admin/ui";
import { deleteClientRecord, updateClientRecord } from "../../actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClient(id);
  if (!data) notFound();
  const { client, orders, galleries } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/clients" className="text-xs text-muted hover:text-ink">← Clients</Link>
          <h1 className="mt-2 font-display text-3xl">{client.name}</h1>
          <p className="mt-1 text-sm text-muted">
            <a href={`mailto:${client.email}`} className="underline">{client.email}</a>
            {client.phone ? ` · ${client.phone}` : ""}
            {client.company ? ` · ${client.company}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/orders/new?client=${client.id}`} className="btn-primary px-4 py-2">
            New order
          </Link>
          <Link href={`/admin/galleries/new?client=${client.id}`} className="btn-secondary px-4 py-2">
            New gallery
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <section className="card p-5">
            <h2 className="font-medium">Orders</h2>
            {orders.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No orders yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line text-sm">
                {orders.map((o) => (
                  <li key={o.id} className="py-2.5">
                    <Link href={`/admin/orders/${o.id}`} className="flex justify-between gap-3 hover:text-brass-2">
                      <span>#{o.order_number} · {o.title}</span>
                      <span className="text-xs text-muted">
                        {orderStatusLabels[o.status]} · {formatMoney(o.amount_cents, o.currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="font-medium">Galleries</h2>
            {galleries.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No galleries yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line text-sm">
                {galleries.map((g) => (
                  <li key={g.id} className="py-2.5">
                    <Link href={`/admin/galleries/${g.id}`} className="flex justify-between gap-3 hover:text-brass-2">
                      <span>{g.title}</span>
                      <span className="text-xs text-muted">{g.kind} · {g.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <form action={updateClientRecord.bind(null, client.id)} className="card h-fit space-y-4 p-5">
          <h2 className="font-medium">Details</h2>
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" defaultValue={client.name} required className="input" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" defaultValue={client.email} required className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="label">Phone</label>
              <input id="phone" name="phone" defaultValue={client.phone ?? ""} className="input" />
            </div>
            <div>
              <label htmlFor="company" className="label">Company</label>
              <input id="company" name="company" defaultValue={client.company ?? ""} className="input" />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="label">Notes</label>
            <textarea id="notes" name="notes" rows={4} defaultValue={client.notes ?? ""} className="input" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="btn-primary">Save</button>
            <ConfirmSubmit
              className="btn-danger"
              message="Delete this client? Only possible when they have no orders or galleries."
              formAction={deleteClientRecord.bind(null, client.id)}
            >
              Delete
            </ConfirmSubmit>
          </div>
        </form>
      </div>
    </div>
  );
}
