import Link from "next/link";
import { getPaidThisMonth, listClients } from "@/lib/data/admin";
import { formatMoney } from "@/lib/types";
import { StageBadge, formatDate } from "@/components/admin/badges";

export default async function DashboardPage() {
  const [clients, paid] = await Promise.all([listClients(), getPaidThisMonth()]);
  const active = clients.filter((c) => c.stage !== "archived");

  const unread = active.reduce((n, c) => n + c.unread, 0);
  const awaiting = active.filter((c) => c.stage === "awaiting_payment").length;
  const shoots = active
    .filter((c) => c.next_shoot)
    .sort((a, b) => String(a.next_shoot).localeCompare(String(b.next_shoot)));

  const todo = active.filter(
    (c) =>
      c.unread > 0 ||
      c.stage === "lead" ||
      (c.stage === "proofing" && (c.open_notes > 0 || c.favorites > 0)) ||
      (c.stage === "booked" && !c.next_shoot)
  );

  const tiles = [
    { label: "New messages", value: String(unread), href: "/admin/clients?stage=lead" },
    { label: "Awaiting payment", value: String(awaiting), href: "/admin/clients?stage=awaiting_payment" },
    { label: "Upcoming shoots", value: String(shoots.length), href: "/admin/clients?stage=booked" },
    { label: "Paid this month", value: formatMoney(paid.total_cents), href: "/admin/clients" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="card p-4 transition hover:border-ink/40">
            <p className="text-xs text-muted">{t.label}</p>
            <p className="mt-1 font-display text-3xl">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="font-medium">To do</h2>
          {todo.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing right now.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {todo.slice(0, 10).map((c) => (
                <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/clients/${c.id}`} className="flex flex-wrap items-center justify-between gap-2 hover:text-brass-2">
                    <span className="flex items-center gap-2">
                      {c.unread ? <span className="h-2 w-2 rounded-full bg-brass-2" title="New message" /> : null}
                      <span className="font-medium">{c.name}</span>
                      <StageBadge stage={c.stage} />
                    </span>
                    <span className="text-ink-2">{c.next_step}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-4">
          <h2 className="font-medium">Upcoming shoots</h2>
          {shoots.length === 0 ? (
            <p className="mt-3 text-sm text-muted">None scheduled.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {shoots.slice(0, 10).map((c) => (
                <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                  <Link href={`/admin/clients/${c.id}`} className="flex items-center justify-between gap-2 hover:text-brass-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted">{formatDate(c.next_shoot, true)}</span>
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
