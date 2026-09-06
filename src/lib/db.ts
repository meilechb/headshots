import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

export function dbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Neon serverless (HTTP) client. Use as a tagged template:
 *   const rows = await db()`select * from clients where id = ${id}`
 * Values are always sent as bound parameters, never interpolated.
 */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set.");
    client = neon(url);
  }
  return client;
}

type Row = Record<string, unknown>;

/** Normalizes driver output (Date -> ISO string) so rows are safe to pass to client components. */
export function rows<T>(result: Row[]): T[] {
  return result.map((row) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = v instanceof Date ? v.toISOString() : v;
    }
    return out as T;
  });
}

export function one<T>(result: Row[]): T | null {
  return rows<T>(result)[0] ?? null;
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
