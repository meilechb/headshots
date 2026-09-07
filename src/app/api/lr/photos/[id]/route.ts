import { db, one } from "@/lib/db";
import { assertUuid, json, withApi } from "@/lib/lr";
import { deleteBlobs } from "@/lib/storage";

type Ctx = { params: Promise<{ id: string }> };

/** DELETE /api/lr/photos/:id, called when a photo is removed from the published collection. */
export const DELETE = withApi(async (_request, { params }: Ctx) => {
  const { id } = await params;
  assertUuid(id, "photo id");
  const photo = one<{ original_url: string; preview_url: string }>(
    await db()`select original_url, preview_url from photos where id = ${id} limit 1`
  );
  if (!photo) return json({ deleted: false, reason: "not found" });
  await deleteBlobs("galleries", [photo.original_url, photo.preview_url]);
  await db()`delete from photos where id = ${id}`;
  return json({ deleted: true });
});
