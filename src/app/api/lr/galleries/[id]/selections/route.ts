import { db, rows } from "@/lib/db";
import { json, loadGallery, withApi } from "@/lib/lr";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lr/galleries/:id/selections, the client's favorites. */
export const GET = withApi(async (_request, { params }: Ctx) => {
  const { id } = await params;
  const gallery = await loadGallery(id);
  const favorites = rows<{ photo_id: string; lr_photo_id: string | null; filename: string; updated_at: string }>(
    await db()`
      select s.photo_id, p.lr_photo_id, p.filename, s.updated_at
      from photo_selections s join photos p on p.id = s.photo_id
      where s.gallery_id = ${gallery.id} and s.selected
      order by p.sort_order asc`
  );
  return json({ favorites });
});
