import Link from "next/link";
import { listClients } from "@/lib/data/admin";
import { clientStageLabels, clientStages, type ClientStage } from "@/lib/types";
import { StageBadge, formatDate } from "@/components/admin/badges";
import { ActionForm, Disclosure, Field } from "@/components/admin/form";
import { createClient } from "../actions";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; q?: string }>;
}) {
  const [{ stage, q }, all] = await Promise.all([searchParams, listClients()]);
  const activeStage = clientStages.includes(stage as ClientStage) ? (stage as ClientStage) : null;
  const query = (q ?? "").trim().toLowerCase();

  const counts = Object.fromEntries(clientStages.map((s) => [s, 0])) as Record<ClientStage, number>;
  for (const c of all) counts[c.stage] += 1;
  const unreadTotal = all.reduce((n, c) => n + c.unread, 0);

  const clients = all.filter((c) => {
    if (activeStage ? c.stage !== activeStage : c.stage === "archived") return false;
    if (!query) return true;
    return [c.name, c.email, c.company ?? ""].some((v) => v.toLowerCase().includes(query));
  });

  const tabs: { key: ClientStage | null; label: string; count: number }[] = [
    { key: null, label: "All", count: all.length - counts.archived },
    ...clientStages.map((s) => ({ key: s as ClientStage | null, label: clientStageLabels[s], count: counts[s] })),
  ].filter((t) => t.key !== "archived" || t.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Clients</h1>
          <p className="mt-2 text-sm text-muted">
            Everyone who wrote in or booked. Messages from the contact form land here.
            {unreadTotal ? ` ${unreadTotal} new.` : ""}
          </p>
        </div>
        <Disclosure label="Add client">
          <ActionForm
            action={createClient}
            className="card mt-4 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2"
            submitLabel="Add client"
            pendingLabel="Adding…"
          >
            <Field label="Name" htmlFor="new-name">
              <input id="new-name" name="name" required className="input" autoComplete="off" />
            </Field>
            <Field label="Email" htmlFor="new-email">
              <input id="new-email" name="email" type="email" required className="input" autoComplete="off" />
            </Field>
            <Field label="Phone" htmlFor="new-phone" hint="optional">
              <input id="new-phone" name="phone" type="tel" className="input" />
            </Field>
            <Field label="Company" htmlFor="new-company" hint="optional">
              <input id="new-company" name="company" className="input" />
            </Field>
          </ActionForm>
        </Disclosure>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Stage">
          {tabs.map((t) => {
            const active = t.key === activeStage;
            const href = t.key ? `/admin/clients?stage=${t.key}` : "/admin/clients";
            return (
              <Link
                key={t.label}
                href={query ? `${href}${t.key ? "&" : "?"}q=${encodeURIComponent(q ?? "")}` : href}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 border px-3 text-xs uppercase tracking-[0.06em] transition ${
                  active ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-ink hover:text-ink"
                }`}
              >
                {t.label}
                <span className={active ? "text-paper/70" : "text-muted"}>{t.count}</span>
              </Link>
            );
          })}
        </nav>
        <form method="get" className="flex gap-2">
          {activeStage ? <input type="hidden" name="stage" value={activeStage} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, email, company"
            aria-label="Search clients"
            className="input min-h-9 py-1.5 md:w-64"
          />
          <button type="submit" className="btn-secondary min-h-9 px-3 py-1.5 text-xs">Search</button>
        </form>
      </div>

      {clients.length === 0 ? (
        <p className="card p-6 text-sm text-muted">
          {all.length === 0
            ? "No clients yet. They appear here when someone uses the contact form, or add one above."
            : "Nobody matches."}
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Next step</th>
                <th className="px-4 py-3 text-right">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-paper-2/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="group flex items-start gap-2">
                      {c.unread ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brass-2" title="New message" />
                      ) : (
                        <span className="mt-1.5 h-2 w-2 shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="block font-medium group-hover:underline">{c.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {c.company ? `${c.company} · ` : ""}{c.email}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StageBadge stage={c.stage} /></td>
                  <td className="px-4 py-3 text-ink-2">{c.next_step}</td>
                  <td className="px-4 py-3 text-right text-muted">{formatDate(c.last_activity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
