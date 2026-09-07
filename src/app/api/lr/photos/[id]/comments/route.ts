import { db, one, rows } from "@/lib/db";
import { ApiError, assertUuid, json, readJson, withApi } from "@/lib/lr";
import type { PhotoComment } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/lr/photos/:id/comments */
export const GET = withApi(async (_request, { params }: Ctx) => {
  const { id } = await params;
  assertUuid(id, "photo id");
  const comments = rows<PhotoComment>(
    await db()`select * from photo_comments where photo_id = ${id} order by created_at asc`
  );
  return json({ comments });
});

/** POST /api/lr/photos/:id/comments { body }, a reply typed in Lightroom's Comments panel. */
export const POST = withApi(async (request, { params }: Ctx) => {
  const { id } = await params;
  assertUuid(id, "photo id");
  const { body } = await readJson<{ body?: string }>(request);
  const text = String(body ?? "").trim().slice(0, 2000);
  if (!text) throw new ApiError("body is required");

  const photo = one<{ gallery_id: string }>(await db()`select gallery_id from photos where id = ${id} limit 1`);
  if (!photo) throw new ApiError("Photo not found", 404);

  const comment = one<PhotoComment>(
    await db()`
      insert into photo_comments (photo_id, gallery_id, author_name, author_role, body)
      values (${id}, ${photo.gallery_id}, 'Photographer', 'admin', ${text})
      returning *`
  );
  return json({ comment }, 201);
});
