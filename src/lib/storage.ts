import "server-only";

import { del, get } from "@vercel/blob";

/**
 * Vercel Blob. Two stores:
 *   galleries  (private) — client photos, streamed through /api/photo/[id]
 *   portfolio  (public)  — marketing images served directly by next/image
 */
export type Store = "galleries" | "portfolio";

export function blobToken(store: Store) {
  const token =
    store === "portfolio"
      ? (process.env.PORTFOLIO_BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_READ_WRITE_TOKEN)
      : process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      `Blob token for the ${store} store is not set (BLOB_READ_WRITE_TOKEN / PORTFOLIO_BLOB_READ_WRITE_TOKEN).`
    );
  }
  return token;
}

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getPrivateBlob(url: string, ifNoneMatch?: string) {
  return get(url, {
    access: "private",
    token: blobToken("galleries"),
    ifNoneMatch,
  });
}

/** Best-effort delete; a missing blob must not block deleting the database row. */
export async function deleteBlobs(store: Store, urls: Array<string | null | undefined>) {
  const list = urls.filter((u): u is string => Boolean(u));
  if (list.length === 0) return;
  try {
    await del(list, { token: blobToken(store) });
  } catch (error) {
    console.error(`Failed to delete ${list.length} blob(s) from ${store}:`, error);
  }
}

/** Public portfolio URLs live on *.public.blob.vercel-storage.com (see next.config.ts). */
export const PUBLIC_BLOB_HOST_PATTERN = "*.public.blob.vercel-storage.com";
