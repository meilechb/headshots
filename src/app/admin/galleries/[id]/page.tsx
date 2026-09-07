import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryDetail } from "@/lib/data/admin";
import { site } from "@/lib/site";
import { galleryKindLabels } from "@/lib/types";
import { GalleryStatusBadge } from "@/components/admin/badges";
import { ActionForm, Disclosure, Field, SubmitButton } from "@/components/admin/form";
import { ConfirmSubmit, CopyButton } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { PhotoManager } from "@/components/admin/photo-manager";
import { EmailGalleryButton } from "@/components/admin/email-gallery-button";
import { emailConfigured } from "@/lib/email";
import { deleteGallery, regenerateAccessCode, setGalleryStatus, updateGallery } from "../../actions";

// Image processing in server actions can exceed the default function timeout.
export const maxDuration = 60;

const btn = "btn-secondary px-3 py-2 text-xs";

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
  const code = gallery.access_code ?? "";
  const favorites = photos.filter((p) => p.selected).length;
  const openNotes = photos.reduce(
    (n, p) => n + p.comments.filter((c) => c.author_role === "client" && !c.resolved).length,
    0
  );
  const firstName = gallery.client.name.split(" ")[0];
  const what = gallery.kind === "proof" ? "proofs" : "final photos";
  const mailto = `mailto:${gallery.client.email}?subject=${encodeURIComponent(
    `Your ${what}: ${site.name}`
  )}&body=${encodeURIComponent(`Hi ${firstName},\n\nYour ${what} are ready:\n${link}\nCode: ${code}\n\n${site.name}`)}`;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/galleries" className="inline-flex min-h-9 items-center text-xs text-muted hover:text-ink">
          ← Galleries
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl">{gallery.title}</h1>
          <GalleryStatusBadge status={gallery.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          <Link href={`/admin/clients/${gallery.client.id}`} className="underline hover:text-ink">{gallery.client.name}</Link>
          {" · "}{galleryKindLabels[gallery.kind]}
          {" · "}{photos.length} photo{photos.length === 1 ? "" : "s"}
          {favorites ? ` · ${favorites} favorite${favorites === 1 ? "" : "s"}` : ""}
          {openNotes ? ` · ${openNotes} note${openNotes === 1 ? "" : "s"}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {gallery.status !== "published" ? (
          <form action={setGalleryStatus.bind(null, gallery.id, "published")}>
            <SubmitButton
              className="btn-primary px-3 py-2 text-xs"
              pendingLabel="…"
              disabled={photos.length === 0}
              title={photos.length === 0 ? "Upload photos first" : undefined}
            >
              {gallery.status === "archived" ? "Reopen" : "Make live"}
            </SubmitButton>
          </form>
        ) : (
          <form action={setGalleryStatus.bind(null, gallery.id, "archived")}>
            <SubmitButton className={btn} pendingLabel="…">Close</SubmitButton>
          </form>
        )}
        <CopyButton value={link} label="Copy link" />
        <CopyButton value={code} label={`Copy code ${code}`} />
        {emailConfigured() ? (
          <EmailGalleryButton galleryId={gallery.id} />
        ) : (
          <a href={mailto} className={btn}>Email client</a>
        )}
        <form action={regenerateAccessCode.bind(null, gallery.id)}>
          <SubmitButton className={btn} pendingLabel="…">New code</SubmitButton>
        </form>
        <a href={link} target="_blank" rel="noreferrer" className={btn}>Preview ↗</a>
        <Disclosure label="Settings" openLabel="Close settings" className={btn}>
          <ActionForm
            key={`${gallery.kind}-${gallery.allow_downloads}-${gallery.expires_at ?? ""}-${gallery.title}-${gallery.welcome_message ?? ""}`}
            action={updateGallery.bind(null, gallery.id)}
            className="card mt-2 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2"
            buttonClassName="btn-primary px-3 py-2 text-xs"
          >
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" defaultValue={gallery.title} required className="input" />
            </Field>
            <Field label="Type" htmlFor="kind">
              <select id="kind" name="kind" defaultValue={gallery.kind} className="input">
                <option value="proof">Proofs</option>
                <option value="final">Final photos</option>
              </select>
            </Field>
            <Field label="Note to client" htmlFor="welcome_message">
              <input id="welcome_message" name="welcome_message" defaultValue={gallery.welcome_message ?? ""} className="input" />
            </Field>
            <Field label="Closes on" htmlFor="expires_at">
              <input
                id="expires_at"
                name="expires_at"
                type="date"
                defaultValue={gallery.expires_at ? gallery.expires_at.slice(0, 10) : ""}
                className="input"
              />
            </Field>
            <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" name="allow_downloads" defaultChecked={gallery.allow_downloads} className="h-4 w-4" />
              Client can download
            </label>
          </ActionForm>
        </Disclosure>
        <form action={deleteGallery.bind(null, gallery.id)}>
          <ConfirmSubmit className="btn-danger px-3 py-2 text-xs" message="Delete this gallery and all its photos?">
            Delete
          </ConfirmSubmit>
        </form>
      </div>

      <Uploader target={{ kind: "gallery", galleryId: gallery.id }} />
      <PhotoManager photos={photos} />
    </div>
  );
}
