import { db, rows, UUID_RE } from "@/lib/db";
import { ApiError, json, readJson, withApi } from "@/lib/lr";
import type { PhotoComment } from "@/lib/types";

/**
 * POST /api/lr/feedback { photo_ids: string[] }
 * Comments and favorite flags for a batch of photos, keyed by photo id. Used by
 * the plugin when Lightroom refreshes the Comments panel.
 */
export const POST = withApi(async (request) => {
  const body = await readJson<{ photo_ids?: string[] }>(request);
  const ids = (body.photo_ids ?? []).filter((x) => typeof x === "string" && UUID_RE.test(x)).slice(0, 500);
  if (ids.length === 0) throw new ApiError("photo_ids is required");

  const [comments, favorites] = await Promise.all([
    db()`select * from photo_comments where photo_id = any(${ids}::uuid[]) order by created_at asc`,
    db()`select photo_id from photo_selections where photo_id = any(${ids}::uuid[]) and selected`,
  ]);

  const byPhoto: Record<string, PhotoComment[]> = {};
  for (const c of rows<PhotoComment>(comments)) {
    (byPhoto[c.photo_id] ??= []).push(c);
  }
  return json({
    comments: byPhoto,
    favorites: rows<{ photo_id: string }>(favorites).map((f) => f.photo_id),
  });
});
