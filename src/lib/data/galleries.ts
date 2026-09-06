import "server-only";

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Client,
  Gallery,
  Photo,
  PhotoComment,
  PhotoSelection,
} from "@/lib/types";

/**
 * Client-facing gallery reads. These use the secret key because clients have
 * no Supabase account; callers MUST first verify access with
 * hasGalleryAccess() from lib/gallery-access.ts.
 */

export const SIGNED_URL_TTL = 60 * 60; // 1 hour

export const getGalleryBySlug = cache(
  async (slug: string): Promise<(Gallery & { client: Client }) | null> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("galleries")
      .select("*, client:clients(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return null;
    return data as unknown as Gallery & { client: Client };
  }
);

export type GalleryPhoto = Photo & {
  url: string;
  downloadUrl: string | null;
  comments: PhotoComment[];
  selected: boolean;
};

export async function getGalleryPhotos(
  gallery: Gallery
): Promise<GalleryPhoto[]> {
  const supabase = createAdminClient();

  const [{ data: photos }, { data: comments }, { data: selections }] =
    await Promise.all([
      supabase
        .from("photos")
        .select("*")
        .eq("gallery_id", gallery.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("photo_comments")
        .select("*")
        .eq("gallery_id", gallery.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("photo_selections")
        .select("*")
        .eq("gallery_id", gallery.id),
    ]);

  const list = (photos as Photo[] | null) ?? [];
  if (list.length === 0) return [];

  const paths = list.map((p) => p.storage_path);
  const [viewRes, downloadRes] = await Promise.all([
    supabase.storage.from("galleries").createSignedUrls(paths, SIGNED_URL_TTL),
    gallery.allow_downloads
      ? supabase.storage
          .from("galleries")
          .createSignedUrls(paths, SIGNED_URL_TTL, { download: true })
      : Promise.resolve({ data: null }),
  ]);

  const viewByPath = new Map(
    (viewRes.data ?? []).map((r) => [r.path, r.signedUrl] as const)
  );
  const dlByPath = new Map(
    (downloadRes.data ?? []).map((r) => [r.path, r.signedUrl] as const)
  );
  const commentsByPhoto = new Map<string, PhotoComment[]>();
  for (const c of (comments as PhotoComment[] | null) ?? []) {
    const arr = commentsByPhoto.get(c.photo_id) ?? [];
    arr.push(c);
    commentsByPhoto.set(c.photo_id, arr);
  }
  const selectedSet = new Set(
    ((selections as PhotoSelection[] | null) ?? [])
      .filter((s) => s.selected)
      .map((s) => s.photo_id)
  );

  return list
    .map((p) => ({
      ...p,
      url: viewByPath.get(p.storage_path) ?? "",
      downloadUrl: gallery.allow_downloads
        ? (dlByPath.get(p.storage_path) ?? null)
        : null,
      comments: commentsByPhoto.get(p.id) ?? [],
      selected: selectedSet.has(p.id),
    }))
    .filter((p) => p.url);
}

export function isGalleryExpired(gallery: Gallery) {
  return Boolean(gallery.expires_at && new Date(gallery.expires_at) < new Date());
}
