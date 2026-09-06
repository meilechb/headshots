import Link from "next/link";
import { listClients, listOrders } from "@/lib/data/admin";
import { createGallery } from "../../actions";

export default async function NewGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; order?: string }>;
}) {
  const [{ client, order }, clients, orders] = await Promise.all([
    searchParams,
    listClients(),
    listOrders(),
  ]);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/galleries" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">← Galleries</Link>
      <h1 className="mt-2 font-display text-3xl">New gallery</h1>
      <p className="mt-2 text-sm text-muted">
        A private link plus a 6-character access code is generated for you. Upload photos on the next screen, then publish.
      </p>

      {clients.length === 0 ? (
        <p className="card mt-8 p-6 text-sm">
          Add a <Link href="/admin/clients" className="underline">client</Link> first.
        </p>
      ) : (
        <form action={createGallery} className="card mt-8 space-y-5 p-6">
          <div>
            <label htmlFor="client_id" className="label">Client</label>
            <select id="client_id" name="client_id" defaultValue={client ?? ""} required className="input">
              <option value="" disabled>Choose…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="order_id" className="label">Order <span className="text-muted">(optional)</span></label>
            <select id="order_id" name="order_id" defaultValue={order ?? ""} className="input">
              <option value="">Not linked</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>#{o.order_number} · {o.client?.name} — {o.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input id="title" name="title" required className="input" placeholder="Jane Doe — Proofs" />
            </div>
            <div>
              <label htmlFor="kind" className="label">Type</label>
              <select id="kind" name="kind" defaultValue="proof" className="input">
                <option value="proof">Proofs (first edits, comments on)</option>
                <option value="final">Final delivery (downloads on)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary">Create gallery</button>
        </form>
      )}
    </div>
  );
}
