import Link from "next/link";
import { listClients } from "@/lib/data/admin";
import { createClientRecord } from "../actions";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="eyebrow">People</p>
        <h1 className="mt-2 font-display text-3xl">Clients</h1>
        {clients.length === 0 ? (
          <p className="card mt-8 p-6 text-sm text-muted">
            No clients yet. Add one on the right, or convert an inquiry.
          </p>
        ) : (
          <div className="card mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-paper-2/40">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="font-medium hover:text-brass-2">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{c.email}</td>
                    <td className="px-4 py-3 text-muted">{c.company ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form action={createClientRecord} className="card h-fit space-y-4 p-5">
        <h2 className="font-medium">Add a client</h2>
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="label">Phone</label>
            <input id="phone" name="phone" className="input" />
          </div>
          <div>
            <label htmlFor="company" className="label">Company</label>
            <input id="company" name="company" className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="label">Notes</label>
          <textarea id="notes" name="notes" rows={3} className="input" />
        </div>
        <button type="submit" className="btn-primary">Add client</button>
      </form>
    </div>
  );
}
