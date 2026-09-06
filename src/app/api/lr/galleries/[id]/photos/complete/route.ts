import { ApiError, json, loadGallery, makePreview, readJson, resolveUploadedBlob, serializePhoto, upsertLightroomPhoto, withApi } from "@/lib/lr";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/lr/galleries/:id/photos/complete { pathname, base, lr_photo_id, filename }
 * Verifies the upload, builds the web-size preview, and records (or replaces)
 * the photo. Republishing the same Lightroom photo keeps its comments.
 */
export const POST = withApi(async (request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const body = await readJson<{ pathname?: string; base?: string; lr_photo_id?: string; filename?: string }>(request);

  const pathname = String(body.pathname ?? "");
  const lrPhotoId = String(body.lr_photo_id ?? "").trim();
  const base = String(body.base ?? "").trim();
  if (!pathname.startsWith(`galleries/${gallery.id}/lr/`)) throw new ApiError("pathname does not belong to this gallery");
  if (!lrPhotoId || !base) throw new ApiError("lr_photo_id and base are required");

  const uploaded = await resolveUploadedBlob(pathname);
  const preview = await makePreview(uploaded.url, gallery.id, base);

  const { photo, replaced } = await upsertLightroomPhoto({
    galleryId: gallery.id,
    lrPhotoId,
    filename: String(body.filename ?? `${base}.jpg`),
    originalUrl: uploaded.url,
    previewUrl: preview.previewUrl,
    width: preview.width,
    height: preview.height,
    size: uploaded.size,
  });

  return json({ photo: serializePhoto(photo), replaced, gallery_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/g/${gallery.slug}` }, replaced ? 200 : 201);
});
