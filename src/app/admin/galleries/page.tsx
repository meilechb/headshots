import Link from "next/link";
import { listClientOptions, listGalleries } from "@/lib/data/admin";
import { galleryKindLabels } from "@/lib/types";
import { GalleryStatusBadge, formatDate } from "@/components/admin/badges";
import { ActionForm } from "@/components/admin/form";
import { createGallery } from "../actions";

export default async function GalleriesPage() {
  const [galleries, clients] = await Promise.all([listGalleries(), listClientOptions()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Galleries</h1>
        {clients.length ? (
          <ActionForm
            action={createGallery}
            className="flex flex-wrap items-center gap-2"
            submitLabel="New gallery"
            pendingLabel="Creating…"
          >
            <select name="client_id" required defaultValue="" aria-label="Client" className="input w-auto min-w-40">
              <option value="" disabled>Client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select name="kind" defaultValue="proof" aria-label="Type" className="input w-auto">
              <option value="proof">Proofs</option>
              <option value="final">Final photos</option>
            </select>
          </ActionForm>
        ) : null}
      </div>

      {galleries.length === 0 ? (
        <p className="card p-6 text-sm text-muted">No galleries yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3">Gallery</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {galleries.map((g) => (
                <tr key={g.id} className="hover:bg-paper-2/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/galleries/${g.id}`} className="font-medium hover:underline">
                      {g.title}
                    </Link>
                    <p className="text-xs text-muted">{galleryKindLabels[g.kind]}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${g.client.id}`} className="hover:underline">{g.client.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {g.photo_count}
                    {g.favorites ? ` · ${g.favorites} ★` : ""}
                    {g.open_notes ? ` · ${g.open_notes} notes` : ""}
                  </td>
                  <td className="px-4 py-3"><GalleryStatusBadge status={g.status} /></td>
                  <td className="px-4 py-3 text-right text-muted">{formatDate(g.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
