import Link from "next/link";
import { listClients } from "@/lib/data/admin";
import { clientStageLabels, clientStages, type ClientStage } from "@/lib/types";
import { StageBadge, formatDate } from "@/components/admin/badges";
import { ActionForm, Disclosure } from "@/components/admin/form";
import { Icon } from "@/components/admin/icons";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Clients</h1>
        <Disclosure label={<><Icon name="plus" />Add client</>}>
          <ActionForm
            action={createClient}
            className="card mt-2 flex flex-wrap items-center gap-2 p-3"
            submitLabel="Add"
            pendingLabel="Adding…"
          >
            <input name="name" required placeholder="Name" aria-label="Name" autoComplete="off" className="input w-auto flex-1 min-w-40" />
            <input name="email" type="email" required placeholder="Email" aria-label="Email" autoComplete="off" className="input w-auto flex-1 min-w-40" />
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
                className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm transition ${
                  active ? "border-ink bg-ink text-paper" : "border-transparent text-ink-2 hover:border-line hover:text-ink"
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
            placeholder="Search"
            aria-label="Search clients"
            className="input md:w-56"
          />
        </form>
      </div>

      {clients.length === 0 ? (
        <p className="card p-6 text-sm text-muted">{all.length === 0 ? "No clients yet." : "Nobody matches."}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Next step</th>
                <th className="px-4 py-3 text-right">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-paper-3/40">
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
