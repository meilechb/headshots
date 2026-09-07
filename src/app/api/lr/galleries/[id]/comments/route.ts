import { db, rows } from "@/lib/db";
import { json, loadGallery, withApi } from "@/lib/lr";
import type { PhotoComment } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lr/galleries/:id/comments, every note in the gallery, oldest first. */
export const GET = withApi(async (_request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const comments = rows<PhotoComment & { lr_photo_id: string | null; filename: string }>(
    await db()`
      select c.*, p.lr_photo_id, p.filename
      from photo_comments c join photos p on p.id = c.photo_id
      where c.gallery_id = ${gallery.id}
      order by c.created_at asc`
  );
  return json({ comments });
});
