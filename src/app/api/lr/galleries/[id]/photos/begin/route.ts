import { issueSignedToken, presignUrl } from "@vercel/blob";
import { ALLOWED_TYPES, ApiError, json, loadGallery, MAX_UPLOAD_BYTES, readJson, safeSegment, withApi } from "@/lib/lr";
import { blobToken } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/lr/galleries/:id/photos/begin { lr_photo_id, filename, content_type, size }
 * Returns a presigned PUT URL. The plugin uploads the full-size file straight
 * to the private Blob store (Vercel functions cap request bodies at 4.5 MB),
 * then calls /photos/complete.
 */
export const POST = withApi(async (request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const body = await readJson<{ lr_photo_id?: string; filename?: string; content_type?: string; size?: number }>(request);

  const lrPhotoId = String(body.lr_photo_id ?? "").trim();
  if (!lrPhotoId) throw new ApiError("lr_photo_id is required");
  const contentType = String(body.content_type ?? "image/jpeg");
  if (!ALLOWED_TYPES.includes(contentType)) throw new ApiError("Unsupported content_type");
  if (typeof body.size === "number" && body.size > MAX_UPLOAD_BYTES) throw new ApiError("File too large", 413);

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const base = `${safeSegment(lrPhotoId, 60)}-${Date.now()}`;
  const pathname = `galleries/${gallery.id}/lr/${base}.${ext}`;
  const validUntil = Date.now() + 60 * 60 * 1000;

  const token = await issueSignedToken({
    pathname,
    operations: ["put"],
    allowedContentTypes: ALLOWED_TYPES,
    maximumSizeInBytes: MAX_UPLOAD_BYTES,
    validUntil,
    token: blobToken("galleries"),
  });
  const { presignedUrl } = await presignUrl(token, {
    operation: "put",
    pathname,
    access: "private",
    allowedContentTypes: ALLOWED_TYPES,
    maximumSizeInBytes: MAX_UPLOAD_BYTES,
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });

  return json({ upload_url: presignedUrl, pathname, base, content_type: contentType, expires_at: new Date(validUntil).toISOString() });
});
