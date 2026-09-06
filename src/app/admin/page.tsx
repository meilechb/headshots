import Link from "next/link";
import { getDashboard } from "@/lib/data/admin";
import { formatMoney, orderStatusLabels } from "@/lib/types";
import { toggleCommentResolved } from "./actions";

export default async function AdminDashboard() {
  const d = await getDashboard();

  const stats = [
    { label: "New inquiries", value: d.newInquiries, href: "/admin/inquiries" },
    { label: "Awaiting payment", value: d.pendingOrders, href: "/admin/orders?status=pending_payment" },
    { label: "Live galleries", value: d.activeGalleries, href: "/admin/galleries" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Studio</p>
          <h1 className="mt-2 font-display text-3xl">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders/new" className="btn-primary px-4 py-2">
            New order
          </Link>
          <Link href="/admin/galleries/new" className="btn-secondary px-4 py-2">
            New gallery
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:border-ink/30">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent client notes</h2>
            <Link href="/admin/galleries" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
              All galleries →
            </Link>
          </div>
          {d.recentComments.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No notes from clients yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {d.recentComments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">
                      {c.author_name} on{" "}
                      {c.photo?.gallery ? (
                        <Link
                          href={`/admin/galleries/${c.photo.gallery.id}`}
                          className="underline hover:text-ink"
                        >
                          {c.photo.gallery.title}
                        </Link>
                      ) : (
                        "a gallery"
                      )}{" "}
                      · {c.photo?.filename}
                    </p>
                    <p className={`mt-1 ${c.resolved ? "text-muted line-through" : ""}`}>{c.body}</p>
                  </div>
                  <form action={toggleCommentResolved.bind(null, c.id, !c.resolved)}>
                    <button type="submit" className="btn-ghost px-2 py-1 text-xs">
                      {c.resolved ? "Reopen" : "Resolve"}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent orders</h2>
            <Link href="/admin/orders" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
              All orders →
            </Link>
          </div>
          {d.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No orders yet.{" "}
              <Link href="/admin/orders/new" className="underline">
                Create the first one.
              </Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {d.recentOrders.map((o) => (
                <li key={o.id} className="py-3 text-sm">
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 hover:text-brass-2">
                    <span className="min-w-0 truncate">
                      #{o.order_number} · {o.client?.name} — {o.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {orderStatusLabels[o.status]} · {formatMoney(o.amount_cents, o.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
