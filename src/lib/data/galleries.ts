import "server-only";

import { cache } from "react";
import { db, one, rows } from "@/lib/db";
import type {
  Client,
  Gallery,
  Photo,
  PhotoComment,
  PhotoSelection,
} from "@/lib/types";

/**
 * Client-facing gallery reads. Callers MUST first verify access with
 * hasGalleryAccess() from lib/gallery-access.ts before rendering photos.
 */

export const getGalleryBySlug = cache(
  async (slug: string): Promise<(Gallery & { client: Client }) | null> => {
    const result = await db()`
      select g.*, row_to_json(c) as client
      from galleries g
      join clients c on c.id = g.client_id
      where g.slug = ${slug}
      limit 1`;
    return one<Gallery & { client: Client }>(result);
  }
);

export type GalleryPhoto = Photo & {
  url: string;
  downloadUrl: string | null;
  comments: PhotoComment[];
  selected: boolean;
};

export function photoWebUrl(id: string) {
  return `/api/photo/${id}?v=web`;
}
export function photoDownloadUrl(id: string) {
  return `/api/photo/${id}?v=full&download=1`;
}

export async function getGalleryPhotos(gallery: Gallery): Promise<GalleryPhoto[]> {
  const [photos, comments, selections] = await Promise.all([
    db()`select * from photos where gallery_id = ${gallery.id} order by sort_order asc, created_at asc`,
    db()`select * from photo_comments where gallery_id = ${gallery.id} order by created_at asc`,
    db()`select * from photo_selections where gallery_id = ${gallery.id} and selected`,
  ]);

  const commentsByPhoto = new Map<string, PhotoComment[]>();
  for (const c of rows<PhotoComment>(comments)) {
    commentsByPhoto.set(c.photo_id, [...(commentsByPhoto.get(c.photo_id) ?? []), c]);
  }
  const selected = new Set(rows<PhotoSelection>(selections).map((s) => s.photo_id));

  return rows<Photo>(photos).map((p) => ({
    ...p,
    url: photoWebUrl(p.id),
    downloadUrl: gallery.allow_downloads ? photoDownloadUrl(p.id) : null,
    comments: commentsByPhoto.get(p.id) ?? [],
    selected: selected.has(p.id),
  }));
}

export type DeliverablePhoto = Photo & {
  gallery: Pick<Gallery, "id" | "status" | "allow_downloads" | "expires_at" | "kind" | "order_id">;
};

/** Used by /api/photo/[id] to decide whether a request may see a file. */
export async function getPhotoForDelivery(id: string): Promise<DeliverablePhoto | null> {
  const result = await db()`
    select p.*,
      json_build_object(
        'id', g.id, 'status', g.status, 'kind', g.kind, 'order_id', g.order_id,
        'allow_downloads', g.allow_downloads, 'expires_at', g.expires_at
      ) as gallery
    from photos p
    join galleries g on g.id = p.gallery_id
    where p.id = ${id}
    limit 1`;
  return one<DeliverablePhoto>(result);
}

export function isGalleryExpired(gallery: Pick<Gallery, "expires_at">) {
  return Boolean(gallery.expires_at && new Date(gallery.expires_at) < new Date());
}
