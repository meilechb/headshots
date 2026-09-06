import "server-only";

import sharp from "sharp";
import { get, put } from "@vercel/blob";
import { blobToken, type Store } from "@/lib/storage";

/** Downloads a blob (private or public store) into memory. */
export async function downloadBlob(url: string, store: Store): Promise<Buffer> {
  const result = await get(url, {
    access: store === "galleries" ? "private" : "public",
    token: blobToken(store),
    useCache: false,
  });
  if (!result || result.statusCode !== 200) throw new Error("Uploaded file not found in storage");
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}

export type WebVersion = { buffer: Buffer; width: number | null; height: number | null };

/**
 * Applies EXIF orientation and scales so the longest edge is at most maxEdge.
 * Returns a JPEG. Works for JPEG, PNG, WebP, TIFF and other formats sharp reads.
 */
export async function makeWebVersion(input: Buffer, maxEdge: number, quality = 86): Promise<WebVersion> {
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const buffer = await image
    .resize({ width: maxEdge, height: maxEdge, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  // .rotate() applied EXIF orientation; report oriented dimensions of the original.
  const swap = (meta.orientation ?? 1) >= 5;
  return {
    buffer,
    width: swap ? (meta.height ?? null) : (meta.width ?? null),
    height: swap ? (meta.width ?? null) : (meta.height ?? null),
  };
}

export async function putJpeg(store: Store, pathname: string, buffer: Buffer) {
  return put(pathname, buffer, {
    access: store === "galleries" ? "private" : "public",
    token: blobToken(store),
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });
}

/** Human-readable reason when sharp cannot read a file. */
export function describeImageError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/unsupported image format|Input buffer contains unsupported/i.test(message)) {
    return "This file type can’t be processed. Export as JPEG, PNG or WebP and try again.";
  }
  return message;
}
