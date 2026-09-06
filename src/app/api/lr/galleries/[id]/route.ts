import { db } from "@/lib/db";
import { ApiError, json, listGalleryPhotos, loadGallery, readJson, serializeGallery, serializePhoto, withApi } from "@/lib/lr";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lr/galleries/:id — gallery, link, code and its photos. */
export const GET = withApi(async (_request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const photos = await listGalleryPhotos(gallery.id);
  return json({ gallery: serializeGallery(gallery, photos.length), photos: photos.map(serializePhoto) });
});

/** PATCH /api/lr/galleries/:id { title?, status?, kind?, welcome_message?, allow_downloads? } */
export const PATCH = withApi(async (request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const body = await readJson<{
    title?: string; status?: string; kind?: string; welcome_message?: string | null; allow_downloads?: boolean;
  }>(request);

  const title = body.title !== undefined ? String(body.title).trim().slice(0, 160) : gallery.title;
  if (!title) throw new ApiError("title cannot be empty");
  const status = ["draft", "published", "archived"].includes(String(body.status)) ? String(body.status) : gallery.status;
  const kind = body.kind === "proof" || body.kind === "final" ? body.kind : gallery.kind;
  const welcome = body.welcome_message === undefined ? gallery.welcome_message : (String(body.welcome_message ?? "").trim() || null);
  const downloads = typeof body.allow_downloads === "boolean" ? body.allow_downloads : gallery.allow_downloads;

  await db()`
    update galleries set title = ${title}, status = ${status}, kind = ${kind},
      welcome_message = ${welcome}, allow_downloads = ${downloads}
    where id = ${gallery.id}`;
  const photos = await listGalleryPhotos(gallery.id);
  return json({ gallery: serializeGallery(await loadGallery(gallery.id), photos.length) });
});
