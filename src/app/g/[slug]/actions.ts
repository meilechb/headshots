"use server";

import { revalidatePath } from "next/cache";
import { GA_EVENTS } from "@/lib/analytics";
import { sendServerEvent } from "@/lib/analytics-server";
import { db, one } from "@/lib/db";
import {
  grantGalleryAccess,
  hasGalleryAccess,
  revokeGalleryAccess,
  verifyAccessCode,
} from "@/lib/gallery-access";
import { getGalleryBySlug, isGalleryExpired } from "@/lib/data/galleries";

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

  try {
    await grantGalleryAccess(gallery.id);
  } catch (error) {
    return { error: `Could not unlock the gallery: ${error instanceof Error ? error.message : String(error)}` };
  }
  await sendServerEvent(GA_EVENTS.galleryUnlock, { gallery: slug });
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

async function photoInGallery(photoId: string, galleryId: string) {
  return one<{ id: string }>(
    await db()`select id from photos where id = ${photoId} and gallery_id = ${galleryId} limit 1`
  );
}

export async function addClientComment(
  slug: string,
  photoId: string,
  body: string
): Promise<{ error?: string }> {
  const text = body.trim().slice(0, 2000);
  if (!text) return { error: "Write a note first." };

  const gallery = await authorize(slug);
  if (!(await photoInGallery(photoId, gallery.id))) return { error: "Photo not found." };

  try {
    await db()`
      insert into photo_comments (photo_id, gallery_id, author_name, author_role, body)
      values (${photoId}, ${gallery.id}, ${gallery.client.name}, 'client', ${text})`;
  } catch {
    return { error: "Could not save your note. Try again." };
  }

  revalidatePath(`/g/${slug}`);
  return {};
}

export async function toggleSelection(
  slug: string,
  photoId: string,
  selected: boolean
): Promise<{ error?: string }> {
  const gallery = await authorize(slug);
  if (!(await photoInGallery(photoId, gallery.id))) return { error: "Photo not found." };

  try {
    await db()`
      insert into photo_selections (photo_id, gallery_id, selected, updated_at)
      values (${photoId}, ${gallery.id}, ${selected}, now())
      on conflict (photo_id) do update set selected = excluded.selected, updated_at = now()`;
  } catch {
    return { error: "Could not save your pick. Try again." };
  }

  revalidatePath(`/g/${slug}`);
  return {};
}
