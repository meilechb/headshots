import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { db, one } from "@/lib/db";
import type { ApiToken } from "@/lib/types";

/**
 * Bearer tokens for the Lightroom plugin (and any other automation).
 * Tokens look like `mb_live_<43 chars>`; only a SHA-256 hash is stored.
 */

export function generateApiToken() {
  return `mb_live_${randomBytes(32).toString("base64url")}`;
}

export function hashApiToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export class ApiAuthError extends Error {
  status = 401;
}

export async function requireApiToken(request: Request): Promise<ApiToken> {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) throw new ApiAuthError("Missing bearer token");

  const row = one<ApiToken>(
    await db()`
      update api_tokens set last_used_at = now()
      where token_hash = ${hashApiToken(match[1])}
      returning id, name, token_prefix, last_used_at, created_at`
  );
  if (!row) throw new ApiAuthError("Invalid token");
  return row;
}
