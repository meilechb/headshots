import "server-only";

import { NextResponse } from "next/server";
import sharp from "sharp";
import { get, head, put } from "@vercel/blob";
import { ApiAuthError, requireApiToken } from "@/lib/api-auth";
import { db, one, rows, UUID_RE } from "@/lib/db";
import { blobToken, deleteBlobs } from "@/lib/storage";
import { site } from "@/lib/site";
import type { Client, Gallery, Photo } from "@/lib/types";

/** Shared plumbing for the Lightroom plugin API under /api/lr. */

export const PREVIEW_MAX_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Wraps a handler: authenticates the bearer token and maps errors to JSON. */
export function withApi<T extends unknown[]>(
  handler: (request: Request, ...args: T) => Promise<Response>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      await requireApiToken(request);
      return await handler(request, ...args);
    } catch (error) {
      if (error instanceof ApiAuthError) return json({ error: error.message }, error.status);
      if (error instanceof ApiError) return json({ error: error.message }, error.status);
      console.error("/api/lr error", error);
      return json({ error: error instanceof Error ? error.message : "Server error" }, 500);
    }
  };
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError("Body must be JSON");
  }
}

export function assertUuid(id: string, what = "id") {
  if (!UUID_RE.test(id)) throw new ApiError(`Invalid ${what}`, 404);
}

export type GalleryWithClient = Gallery & { client: Client };

export async function loadGallery(id: string): Promise<GalleryWithClient> {
  assertUuid(id, "gallery id");
  const g = one<GalleryWithClient>(
    await db()`
      select g.*, row_to_json(c) as client
      from galleries g join clients c on c.id = g.client_id
      where g.id = ${id} limit 1`
  );
  if (!g) throw new ApiError("Gallery not found", 404);
  return g;
}

export function galleryUrl(slug: string) {
  return `${site.url}/g/${slug}`;
}

export function serializeGallery(g: GalleryWithClient, photoCount?: number) {
  return {
    id: g.id,
    slug: g.slug,
    url: galleryUrl(g.slug),
    title: g.title,
    kind: g.kind,
    status: g.status,
    access_code: g.access_code,
    allow_downloads: g.allow_downloads,
    welcome_message: g.welcome_message,
    expires_at: g.expires_at,
    client: { id: g.client.id, name: g.client.name, email: g.client.email },
    photo_count: photoCount,
    created_at: g.created_at,
  };
}

export function safeSegment(s: string, max = 80) {
  return s.replace(/[^\w.\-]+/g, "_").slice(0, max) || "file";
}

/** Downloads the uploaded original, makes a web-size JPEG preview, stores it. */
export async function makePreview(originalUrl: string, galleryId: string, base: string) {
  const token = blobToken("galleries");
  const result = await get(originalUrl, { access: "private", token, useCache: false });
  if (!result || result.statusCode !== 200) throw new ApiError("Uploaded file not found", 404);
  const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());

  const image = sharp(buffer).rotate();
  const meta = await image.metadata();
  const preview = await image
    .resize({ width: PREVIEW_MAX_EDGE, height: PREVIEW_MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  const blob = await put(`galleries/${galleryId}/lr/${base}-web.jpg`, preview, {
    access: "private",
    token,
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });

  // .rotate() applies EXIF orientation, so report oriented dimensions.
  const swap = (meta.orientation ?? 1) >= 5;
  return {
    previewUrl: blob.url,
    width: swap ? (meta.height ?? null) : (meta.width ?? null),
    height: swap ? (meta.width ?? null) : (meta.height ?? null),
    size: buffer.byteLength,
  };
}

/** Confirms a blob exists at pathname and returns its URL and size. */
export async function resolveUploadedBlob(pathname: string) {
  try {
    return await head(pathname, { token: blobToken("galleries") });
  } catch {
    throw new ApiError("No file was uploaded to that pathname", 404);
  }
}

/** Inserts or replaces (same Lightroom photo) a gallery photo. */
export async function upsertLightroomPhoto(input: {
  galleryId: string;
  lrPhotoId: string;
  filename: string;
  originalUrl: string;
  previewUrl: string;
  width: number | null;
  height: number | null;
  size: number;
}): Promise<{ photo: Photo; replaced: boolean }> {
  const existing = one<Photo>(
    await db()`
      select * from photos where gallery_id = ${input.galleryId} and lr_photo_id = ${input.lrPhotoId} limit 1`
  );

  if (existing) {
    const updated = one<Photo>(
      await db()`
        update photos set
          original_url = ${input.originalUrl}, preview_url = ${input.previewUrl},
          filename = ${input.filename.slice(0, 200)}, width = ${input.width}, height = ${input.height},
          size_bytes = ${input.size}
        where id = ${existing.id}
        returning *`
    );
    await deleteBlobs(
      "galleries",
      [existing.original_url, existing.preview_url].filter(
        (u) => u !== input.originalUrl && u !== input.previewUrl
      )
    );
    return { photo: updated!, replaced: true };
  }

  const created = one<Photo>(
    await db()`
      insert into photos (gallery_id, original_url, preview_url, lr_photo_id, filename, width, height, size_bytes, sort_order)
      values (
        ${input.galleryId}, ${input.originalUrl}, ${input.previewUrl}, ${input.lrPhotoId},
        ${input.filename.slice(0, 200)}, ${input.width}, ${input.height}, ${input.size},
        (select coalesce(max(sort_order), -1) + 1 from photos where gallery_id = ${input.galleryId})
      )
      returning *`
  );
  return { photo: created!, replaced: false };
}

export function serializePhoto(p: Photo) {
  return {
    id: p.id,
    lr_photo_id: p.lr_photo_id,
    filename: p.filename,
    width: p.width,
    height: p.height,
    sort_order: p.sort_order,
    created_at: p.created_at,
  };
}

export async function listGalleryPhotos(galleryId: string) {
  return rows<Photo>(
    await db()`select * from photos where gallery_id = ${galleryId} order by sort_order asc, created_at asc`
  );
}
