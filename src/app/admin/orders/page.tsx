import Link from "next/link";
import { listOrders } from "@/lib/data/admin";
import { formatMoney, orderStatusLabels, orderStatuses, type OrderStatus } from "@/lib/types";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await listOrders(filter);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Work</p>
          <h1 className="mt-2 font-display text-3xl">Orders</h1>
        </div>
        <Link href="/admin/orders/new" className="btn-primary px-4 py-2">New order</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 text-xs ${!filter ? "border-ink bg-ink text-paper" : "border-line text-ink-2"}`}
        >
          All
        </Link>
        {orderStatuses.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-xs ${filter === s ? "border-ink bg-ink text-paper" : "border-line text-ink-2"}`}
          >
            {orderStatusLabels[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="card mt-6 p-6 text-sm text-muted">No orders match.</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-paper-2/40">
                  <td className="px-4 py-3 text-muted">{o.order_number}</td>
                  <td className="px-4 py-3">{o.client?.name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brass-2">
                      {o.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {o.shoot_date
                      ? new Date(o.shoot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${o.status === "pending_payment" ? "border-brass/40 text-brass-2" : "border-line text-muted"}`}>
                      {orderStatusLabels[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatMoney(o.amount_cents, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
