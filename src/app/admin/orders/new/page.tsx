import Link from "next/link";
import { listClients, listPackages } from "@/lib/data/admin";
import { orderStatusLabels } from "@/lib/types";
import { createOrder } from "../../actions";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const [{ client }, clients, packages] = await Promise.all([
    searchParams,
    listClients(),
    listPackages(),
  ]);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-xs text-muted hover:text-ink">← Orders</Link>
      <h1 className="mt-2 font-display text-3xl">New order</h1>
      <p className="mt-2 text-sm text-muted">
        An order tracks one job from payment to final delivery. Once saved you get a payment link to send.
      </p>

      {clients.length === 0 ? (
        <p className="card mt-8 p-6 text-sm">
          Add a <Link href="/admin/clients" className="underline">client</Link> first.
        </p>
      ) : (
        <form action={createOrder} className="card mt-8 space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
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
              <label htmlFor="package_id" className="label">Package <span className="text-muted">(optional)</span></label>
              <select id="package_id" name="package_id" defaultValue="" className="input">
                <option value="">None / custom</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ${(p.price_cents / 100).toFixed(0)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" name="title" required className="input" placeholder="Professional headshot session" />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="amount" className="label">Amount (USD)</label>
              <input id="amount" name="amount" inputMode="decimal" required className="input" placeholder="495" />
            </div>
            <div>
              <label htmlFor="shoot_date" className="label">Session date</label>
              <input id="shoot_date" name="shoot_date" type="date" className="input" />
            </div>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue="pending_payment" className="input">
                {(["draft", "pending_payment", "paid", "scheduled"] as const).map((s) => (
                  <option key={s} value={s}>{orderStatusLabels[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">Description <span className="text-muted">(shown to client on the pay page)</span></label>
            <textarea id="description" name="description" rows={3} className="input" placeholder="60-minute studio session, 2 looks, 5 retouched images." />
          </div>
          <div>
            <label htmlFor="notes" className="label">Internal notes</label>
            <textarea id="notes" name="notes" rows={2} className="input" />
          </div>
          <button type="submit" className="btn-primary">Create order</button>
        </form>
      )}
    </div>
  );
}
