import Link from "next/link";
import { listGalleries } from "@/lib/data/admin";

export default async function GalleriesPage() {
  const galleries = await listGalleries();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Delivery</p>
          <h1 className="mt-2 font-display text-3xl">Galleries</h1>
          <p className="mt-2 text-sm text-muted">
            Proof galleries collect favorites and notes. Final galleries deliver downloads.
          </p>
        </div>
        <Link href="/admin/galleries/new" className="btn-primary px-4 py-2">New gallery</Link>
      </div>

      {galleries.length === 0 ? (
        <p className="card mt-8 p-6 text-sm text-muted">No galleries yet.</p>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Gallery</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {galleries.map((g) => (
                <tr key={g.id} className="hover:bg-paper-2/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/galleries/${g.id}`} className="font-medium hover:text-brass-2">
                      {g.title}
                    </Link>
                    <p className="text-xs text-muted">/g/{g.slug}</p>
                  </td>
                  <td className="px-4 py-3">{g.client?.name}</td>
                  <td className="px-4 py-3 capitalize text-muted">{g.kind}</td>
                  <td className="px-4 py-3 text-muted">{g.photo_count}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${g.status === "published" ? "border-success/40 text-success" : "border-line text-muted"}`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
