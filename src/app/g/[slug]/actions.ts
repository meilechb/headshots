"use server";

import { revalidatePath } from "next/cache";
import {
  grantGalleryAccess,
  hasGalleryAccess,
  revokeGalleryAccess,
  verifyAccessCode,
} from "@/lib/gallery-access";
import { getGalleryBySlug, isGalleryExpired } from "@/lib/data/galleries";
import { createAdminClient } from "@/lib/supabase/admin";

export type UnlockState = { error?: string };

export async function unlockGallery(
  _prev: UnlockState,
  formData: FormData
): Promise<UnlockState> {
  const slug = String(formData.get("slug") ?? "");
  const code = String(formData.get("code") ?? "");

  const gallery = await getGalleryBySlug(slug);
  if (!gallery || gallery.status !== "published" || isGalleryExpired(gallery)) {
    return { error: "This gallery is not available." };
  }
  if (!verifyAccessCode(code, gallery.access_code)) {
    return { error: "That code didn’t match. Check your email and try again." };
  }

  await grantGalleryAccess(gallery.id);
  revalidatePath(`/g/${slug}`);
  return {};
}

export async function lockGallery(slug: string) {
  const gallery = await getGalleryBySlug(slug);
  if (gallery) await revokeGalleryAccess(gallery.id);
  revalidatePath(`/g/${slug}`);
}

/** Every mutation re-checks the access cookie; the page-level check does not protect actions. */
async function authorize(slug: string) {
  const gallery = await getGalleryBySlug(slug);
  if (!gallery || gallery.status !== "published" || isGalleryExpired(gallery)) {
    throw new Error("Gallery unavailable");
  }
  if (!(await hasGalleryAccess(gallery.id))) {
    throw new Error("Unauthorized");
  }
  return gallery;
}

export async function addClientComment(
  slug: string,
  photoId: string,
  body: string
): Promise<{ error?: string }> {
  const text = body.trim().slice(0, 2000);
  if (!text) return { error: "Write a note first." };

  const gallery = await authorize(slug);
  const supabase = createAdminClient();

  // Photo must belong to this gallery (prevents cross-gallery writes).
  const { data: photo } = await supabase
    .from("photos")
    .select("id")
    .eq("id", photoId)
    .eq("gallery_id", gallery.id)
    .maybeSingle();
  if (!photo) return { error: "Photo not found." };

  const { error } = await supabase.from("photo_comments").insert({
    photo_id: photoId,
    gallery_id: gallery.id,
    author_name: gallery.client.name,
    author_role: "client",
    body: text,
  });
  if (error) return { error: "Could not save your note. Try again." };

  revalidatePath(`/g/${slug}`);
  return {};
}

export async function toggleSelection(
  slug: string,
  photoId: string,
  selected: boolean
): Promise<{ error?: string }> {
  const gallery = await authorize(slug);
  const supabase = createAdminClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("id")
    .eq("id", photoId)
    .eq("gallery_id", gallery.id)
    .maybeSingle();
  if (!photo) return { error: "Photo not found." };

  const { error } = await supabase.from("photo_selections").upsert(
    {
      photo_id: photoId,
      gallery_id: gallery.id,
      selected,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "photo_id" }
  );
  if (error) return { error: "Could not save your pick. Try again." };

  revalidatePath(`/g/${slug}`);
  return {};
}
