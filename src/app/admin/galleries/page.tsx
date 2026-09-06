import Link from "next/link";
import { listClientOptions, listGalleries } from "@/lib/data/admin";
import { galleryKindLabels } from "@/lib/types";
import { GalleryStatusBadge, formatDate } from "@/components/admin/badges";
import { ActionForm, Disclosure, Field } from "@/components/admin/form";
import { createGallery } from "../actions";

export default async function GalleriesPage() {
  const [galleries, clients] = await Promise.all([listGalleries(), listClientOptions()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Galleries</h1>
          <p className="mt-2 text-sm text-muted">
            Private photo pages for clients. Each has a link and a 6-character code.
          </p>
        </div>
        {clients.length ? (
          <Disclosure label="New gallery">
            <ActionForm
              action={createGallery}
              className="card mt-4 grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_auto_1fr]"
              submitLabel="Create gallery"
              pendingLabel="Creating…"
            >
              <Field label="Client" htmlFor="gallery-client">
                <select id="gallery-client" name="client_id" required defaultValue="" className="input">
                  <option value="" disabled>Choose…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type" htmlFor="gallery-kind">
                <select id="gallery-kind" name="kind" defaultValue="proof" className="input">
                  <option value="proof">Proofs</option>
                  <option value="final">Final photos</option>
                </select>
              </Field>
              <Field label="Title" htmlFor="gallery-title" hint="optional">
                <input id="gallery-title" name="title" className="input" placeholder="Client name — Proofs" />
              </Field>
            </ActionForm>
          </Disclosure>
        ) : null}
      </div>

      {galleries.length === 0 ? (
        <p className="card p-6 text-sm text-muted">
          No galleries yet. Create one here or from a client’s page.
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Gallery</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Photos</th>
                <th className="px-4 py-3">From the client</th>
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
                    <p className="text-xs text-muted">/g/{g.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${g.client.id}`} className="hover:underline">{g.client.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{galleryKindLabels[g.kind]}</td>
                  <td className="px-4 py-3 text-muted">{g.photo_count}</td>
                  <td className="px-4 py-3 text-muted">
                    {g.favorites || g.open_notes
                      ? [
                          g.favorites ? `${g.favorites} favorite${g.favorites === 1 ? "" : "s"}` : null,
                          g.open_notes ? `${g.open_notes} open note${g.open_notes === 1 ? "" : "s"}` : null,
                        ].filter(Boolean).join(" · ")
                      : "—"}
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
