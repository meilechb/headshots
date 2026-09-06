import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { formatMoney, orderStatusLabels, orderStatuses } from "@/lib/types";
import { ConfirmSubmit, CopyButton } from "@/components/admin/ui";
import { deleteOrder, setOrderStatus, updateOrder } from "../../actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data) notFound();
  const { order, galleries } = data;
  const payUrl = `${site.url}/pay/${order.id}`;

  const nextStatus: Record<string, (typeof orderStatuses)[number] | null> = {
    draft: "pending_payment",
    pending_payment: "paid",
    paid: "scheduled",
    scheduled: "editing",
    editing: "proofing",
    proofing: "final_delivered",
    final_delivered: "completed",
    completed: null,
    cancelled: null,
  };
  const advance = nextStatus[order.status];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-muted hover:text-ink">← Orders</Link>
          <h1 className="mt-2 font-display text-3xl">
            #{order.order_number} · {order.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/admin/clients/${order.client.id}`} className="underline">{order.client.name}</Link>
            {" · "}{order.client.email}
            {order.package ? ` · ${order.package.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge border-line">{orderStatusLabels[order.status]}</span>
          {advance ? (
            <form action={setOrderStatus.bind(null, order.id, advance)}>
              <button type="submit" className="btn-primary px-4 py-2">
                Mark {orderStatusLabels[advance].toLowerCase()}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <section className="card p-5">
            <h2 className="font-medium">Payment</h2>
            <p className="mt-1 font-display text-3xl">{formatMoney(order.amount_cents, order.currency)}</p>
            {order.paid_at ? (
              <p className="mt-2 text-sm text-success">
                Paid {new Date(order.paid_at).toLocaleString("en-US")}
                {order.stripe_payment_intent_id ? (
                  <span className="text-muted"> · {order.stripe_payment_intent_id}</span>
                ) : null}
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted">
                  Send this link. The client pays by card through Stripe and the order updates automatically.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 truncate border border-line bg-paper-2 px-3 py-2 text-xs">{payUrl}</code>
                  <CopyButton value={payUrl} />
                </div>
                <a
                  href={`mailto:${order.client.email}?subject=${encodeURIComponent(`Payment for your headshot session — Order #${order.order_number}`)}&body=${encodeURIComponent(`Hi ${order.client.name.split(" ")[0]},\n\nHere is the secure payment link for your session (${formatMoney(order.amount_cents, order.currency)}):\n${payUrl}\n\nThank you,\n${site.name}`)}`}
                  className="btn-secondary mt-3 px-3 py-1.5 text-xs"
                >
                  Email payment link
                </a>
                {order.status !== "pending_payment" ? (
                  <p className="mt-2 text-xs text-muted">
                    The link only accepts payment while the order is “Awaiting payment”.
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Galleries</h2>
              <Link
                href={`/admin/galleries/new?client=${order.client.id}&order=${order.id}`}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                New gallery
              </Link>
            </div>
            {galleries.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Create a proof gallery after the session, then a final gallery for delivery.
              </p>
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

        <form key={`${order.status}-${order.updated_at}`} action={updateOrder.bind(null, order.id)} className="card h-fit space-y-4 p-5">
          <h2 className="font-medium">Details</h2>
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" name="title" defaultValue={order.title} required className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="amount" className="label">Amount (USD)</label>
              <input id="amount" name="amount" defaultValue={(order.amount_cents / 100).toFixed(2)} className="input" />
            </div>
            <div>
              <label htmlFor="shoot_date" className="label">Session date</label>
              <input id="shoot_date" name="shoot_date" type="date" defaultValue={order.shoot_date ?? ""} className="input" />
            </div>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={order.status} className="input">
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>{orderStatusLabels[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">Description (client-facing)</label>
            <textarea id="description" name="description" rows={3} defaultValue={order.description ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="notes" className="label">Internal notes</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={order.notes ?? ""} className="input" />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="btn-primary">Save</button>
            <ConfirmSubmit
              className="btn-danger"
              message="Delete this order? Galleries linked to it are kept."
              formAction={deleteOrder.bind(null, order.id)}
            >
              Delete
            </ConfirmSubmit>
          </div>
        </form>
      </div>
    </div>
  );
}
