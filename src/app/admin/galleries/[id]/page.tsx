import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryDetail } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { galleryKindLabels } from "@/lib/types";
import { GalleryStatusBadge } from "@/components/admin/badges";
import { ActionForm, Field, SubmitButton } from "@/components/admin/form";
import { ConfirmSubmit, CopyButton } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { PhotoManager } from "@/components/admin/photo-manager";
import { EmailGalleryButton } from "@/components/admin/email-gallery-button";
import { emailConfigured } from "@/lib/email";
import { deleteGallery, regenerateAccessCode, setGalleryStatus, updateGallery } from "../../actions";

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
  const canEmail = emailConfigured();
  const emailSubject =
    gallery.kind === "proof" ? `Your proofs are ready, ${site.name}` : `Your final photos are ready, ${site.name}`;
  const emailBody =
    gallery.kind === "proof"
      ? `Hi ${firstName},\n\nYour proofs are ready to review:\n${link}\nAccess code: ${gallery.access_code}\n\nMark your favorites and leave a note on any frame you'd like adjusted. I'll retouch your picks from there.\n\n${site.name}`
      : `Hi ${firstName},\n\nYour final retouched photos are ready to download:\n${link}\nAccess code: ${gallery.access_code}\n\nThank you for working with me.\n\n${site.name}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/galleries" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
            ← Galleries
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl">{gallery.title}</h1>
            <GalleryStatusBadge status={gallery.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/admin/clients/${gallery.client.id}`} className="underline hover:text-ink">{gallery.client.name}</Link>
            {" · "}{galleryKindLabels[gallery.kind]}
            {" · "}{photos.length} photo{photos.length === 1 ? "" : "s"}
            {favorites.length ? ` · ${favorites.length} favorite${favorites.length === 1 ? "" : "s"}` : ""}
            {openNotes ? ` · ${openNotes} open note${openNotes === 1 ? "" : "s"}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {gallery.status !== "published" ? (
            <form action={setGalleryStatus.bind(null, gallery.id, "published")}>
              <SubmitButton
                className="btn-primary px-4 py-2"
                pendingLabel="Publishing…"
                disabled={photos.length === 0}
                title={photos.length === 0 ? "Upload photos first" : undefined}
              >
                {gallery.status === "archived" ? "Reopen" : "Make live"}
              </SubmitButton>
            </form>
          ) : (
            <form action={setGalleryStatus.bind(null, gallery.id, "archived")}>
              <SubmitButton className="btn-secondary px-4 py-2" pendingLabel="Closing…">
                Close gallery
              </SubmitButton>
            </form>
          )}
          <a href={link} target="_blank" rel="noreferrer" className="btn-ghost">
            Preview ↗
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5">
          <h2 className="font-medium">Send to client</h2>
          <p className="mt-1 text-xs text-muted">They need the link and the code.</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate border border-line bg-paper-2 px-3 py-2 text-xs">{link}</code>
            <CopyButton value={link} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate border border-line bg-paper-2 px-3 py-2 font-mono text-base tracking-[0.3em]">
              {gallery.access_code ?? "none"}
            </code>
            <CopyButton value={gallery.access_code ?? ""} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {canEmail ? (
              <EmailGalleryButton galleryId={gallery.id} clientEmail={gallery.client.email} />
            ) : null}
            <a
              href={`mailto:${gallery.client.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              className={`${canEmail ? "btn-secondary" : "btn-primary"} px-3 py-1.5 text-xs`}
            >
              {canEmail ? "Open in mail app" : "Email link + code"}
            </a>
            <form action={regenerateAccessCode.bind(null, gallery.id)}>
              <SubmitButton className="btn-secondary px-3 py-1.5 text-xs" pendingLabel="…">
                New code
              </SubmitButton>
            </form>
          </div>
          {gallery.status !== "published" ? (
            <p className="mt-3 text-xs text-brass-2">
              {gallery.status === "draft"
                ? "Not live yet: the link shows “not found” until you make it live."
                : "Closed: the link shows “gallery closed” until you reopen it."}
            </p>
          ) : null}
        </section>

        <ActionForm
          key={`${gallery.kind}-${gallery.allow_downloads}-${gallery.expires_at ?? ""}-${gallery.title}`}
          action={updateGallery.bind(null, gallery.id)}
          className="card space-y-4 p-5 lg:col-span-2"
          submitLabel="Save settings"
          extra={
            <ConfirmSubmit
              className="btn-danger"
              message="Delete this gallery and all its photos from storage?"
              formAction={deleteGallery.bind(null, gallery.id)}
            >
              Delete gallery
            </ConfirmSubmit>
          }
        >
          <h2 className="font-medium">Settings</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" defaultValue={gallery.title} required className="input" />
            </Field>
            <Field label="Type" htmlFor="kind">
              <select id="kind" name="kind" defaultValue={gallery.kind} className="input">
                <option value="proof">Proofs</option>
                <option value="final">Final photos</option>
              </select>
            </Field>
          </div>
          <Field label="Welcome message" htmlFor="welcome_message" hint="shown above the photos">
            <textarea id="welcome_message" name="welcome_message" rows={2} defaultValue={gallery.welcome_message ?? ""} className="input" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-end">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input type="checkbox" name="allow_downloads" defaultChecked={gallery.allow_downloads} className="h-4 w-4" />
              Client can download the files
            </label>
            <Field label="Closes automatically on" htmlFor="expires_at" hint="optional">
              <input
                id="expires_at"
                name="expires_at"
                type="date"
                defaultValue={gallery.expires_at ? gallery.expires_at.slice(0, 10) : ""}
                className="input"
              />
            </Field>
          </div>
        </ActionForm>
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
