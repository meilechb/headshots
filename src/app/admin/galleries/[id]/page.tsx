import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryDetail } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { ConfirmSubmit, CopyButton } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  deleteGallery,
  regenerateAccessCode,
  setAccessCode,
  setGalleryStatus,
  updateGallery,
} from "../../actions";

// Image processing in server actions can exceed the default function timeout.
export const maxDuration = 60;

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getGalleryDetail(id);
  if (!data) notFound();
  const { gallery, photos } = data;

  const link = `${site.url}/g/${gallery.slug}`;
  const favorites = photos.filter((p) => p.selected);
  const openNotes = photos.reduce(
    (n, p) => n + p.comments.filter((c) => c.author_role === "client" && !c.resolved).length,
    0
  );
  const firstName = gallery.client.name.split(" ")[0];
  const emailBody =
    gallery.kind === "proof"
      ? `Hi ${firstName},\n\nYour proofs are ready to review:\n${link}\nAccess code: ${gallery.access_code}\n\nMark your favorites and leave a note on any frame you'd like adjusted. I'll retouch your picks from there.\n\n${site.name}`
      : `Hi ${firstName},\n\nYour final retouched photos are ready to download:\n${link}\nAccess code: ${gallery.access_code}\n\nThank you for working with me.\n\n${site.name}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/galleries" className="text-xs text-muted hover:text-ink">← Galleries</Link>
          <h1 className="mt-2 font-display text-3xl">{gallery.title}</h1>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/admin/clients/${gallery.client.id}`} className="underline">{gallery.client.name}</Link>
            {" · "}<span className="capitalize">{gallery.kind}</span>
            {gallery.order ? (
              <> · <Link href={`/admin/orders/${gallery.order.id}`} className="underline">Order #{gallery.order.order_number}</Link></>
            ) : null}
            {" · "}{photos.length} photo{photos.length === 1 ? "" : "s"}
            {favorites.length ? ` · ${favorites.length} favorite${favorites.length === 1 ? "" : "s"}` : ""}
            {openNotes ? ` · ${openNotes} open note${openNotes === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${gallery.status === "published" ? "border-green-300 text-green-700" : "border-line text-muted"}`}>
            {gallery.status}
          </span>
          {gallery.status !== "published" ? (
            <form action={setGalleryStatus.bind(null, gallery.id, "published")}>
              <button type="submit" className="btn-primary px-4 py-2" disabled={photos.length === 0}>
                Publish
              </button>
            </form>
          ) : (
            <form action={setGalleryStatus.bind(null, gallery.id, "archived")}>
              <button type="submit" className="btn-secondary px-4 py-2">Archive</button>
            </form>
          )}
          <a href={link} target="_blank" rel="noreferrer" className="btn-ghost">
            Preview ↗
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <h2 className="font-medium">Share with client</h2>
          <p className="mt-1 text-xs text-muted">The client needs both the link and the code.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-paper-2 px-3 py-2 text-xs">{link}</code>
            <CopyButton value={link} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-paper-2 px-3 py-2 font-mono text-base tracking-[0.3em]">
              {gallery.access_code ?? "—"}
            </code>
            <CopyButton value={gallery.access_code ?? ""} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`mailto:${gallery.client.email}?subject=${encodeURIComponent(`${gallery.kind === "proof" ? "Your proofs are ready" : "Your final photos are ready"} — ${site.name}`)}&body=${encodeURIComponent(emailBody)}`}
              className="btn-primary px-3 py-1.5 text-xs"
            >
              Email link + code
            </a>
            <form action={regenerateAccessCode.bind(null, gallery.id)}>
              <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">New code</button>
            </form>
          </div>
          <form action={setAccessCode.bind(null, gallery.id)} className="mt-3 flex gap-2">
            <input name="access_code" placeholder="Custom code" className="input py-1.5 text-xs uppercase" />
            <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Set</button>
          </form>
          {gallery.status !== "published" ? (
            <p className="mt-3 text-xs text-brass-2">Draft: the link shows “not found” until you publish.</p>
          ) : null}
        </section>

        <form
          key={`${gallery.status}-${gallery.kind}-${gallery.allow_downloads}-${gallery.expires_at ?? ""}`}
          action={updateGallery.bind(null, gallery.id)}
          className="card space-y-4 p-5 lg:col-span-2"
        >
          <h2 className="font-medium">Settings</h2>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input id="title" name="title" defaultValue={gallery.title} required className="input" />
            </div>
            <div>
              <label htmlFor="kind" className="label">Type</label>
              <select id="kind" name="kind" defaultValue={gallery.kind} className="input">
                <option value="proof">Proofs</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select id="status" name="status" defaultValue={gallery.status} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="welcome_message" className="label">Welcome message <span className="text-muted">(shown above the photos)</span></label>
            <textarea id="welcome_message" name="welcome_message" rows={2} defaultValue={gallery.welcome_message ?? ""} className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="allow_downloads" defaultChecked={gallery.allow_downloads} className="h-4 w-4" />
              Allow downloads (final galleries)
            </label>
            <div>
              <label htmlFor="expires_at" className="label">Expires <span className="text-muted">(optional)</span></label>
              <input
                id="expires_at"
                name="expires_at"
                type="date"
                defaultValue={gallery.expires_at ? gallery.expires_at.slice(0, 10) : ""}
                className="input"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="btn-primary">Save settings</button>
            <ConfirmSubmit
              className="btn-danger"
              message="Delete this gallery and all its photos from storage?"
              formAction={deleteGallery.bind(null, gallery.id)}
            >
              Delete gallery
            </ConfirmSubmit>
          </div>
        </form>
      </div>

      <section className="space-y-4">
        <h2 className="font-medium">Photos</h2>
        <Uploader target={{ kind: "gallery", galleryId: gallery.id }} />
        {favorites.length ? (
          <details className="card p-4 text-sm">
            <summary className="cursor-pointer font-medium">
              Client favorites ({favorites.length})
            </summary>
            <ul className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((p) => (
                <li key={p.id} className="font-mono text-xs">{p.filename}</li>
              ))}
            </ul>
          </details>
        ) : null}
        <PhotoManager photos={photos} />
      </section>
    </div>
  );
}
