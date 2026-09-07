import "server-only";

import { del, get } from "@vercel/blob";

/**
 * Vercel Blob. Two stores:
 *   galleries  (private), client photos, streamed through /api/photo/[id]
 *   portfolio  (public) , marketing images served directly by next/image
 */
export type Store = "galleries" | "portfolio";

/**
 * Env var names. The galleries store uses Vercel's default BLOB_READ_WRITE_TOKEN.
 * The portfolio store is connected with the env var prefix "PORTFOLIO"; Vercel
 * then names its token PORTFOLIO_READ_WRITE_TOKEN. PORTFOLIO_BLOB_READ_WRITE_TOKEN
 * is accepted as well for setups that pasted the token by hand.
 */
const TOKEN_VARS: Record<Store, string[]> = {
  galleries: ["BLOB_READ_WRITE_TOKEN"],
  portfolio: ["PORTFOLIO_READ_WRITE_TOKEN", "PORTFOLIO_BLOB_READ_WRITE_TOKEN"],
};

export function blobToken(store: Store) {
  for (const name of TOKEN_VARS[store]) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error(
    `The ${store} storage token is not set. Add ${TOKEN_VARS[store].join(" or ")} to the environment variables.`
  );
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
