import "server-only";

import { scryptSync, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

export type CurrentUser = { email: string; role: "admin" };

export function authConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD_HASH &&
      process.env.SESSION_SECRET
  );
}

/**
 * Verifies a password against ADMIN_PASSWORD_HASH produced by
 * `npm run hash-password`. Format: scrypt:N:salt:hash (base64url).
 */
export function verifyAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !stored) return false;

  const [scheme, nStr, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !nStr || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const candidate = scryptSync(password, salt, expected.length, {
    N: Number(nStr),
    r: 8,
    p: 1,
  });

  const emailOk = email.trim().toLowerCase() === expectedEmail;
  const passOk = candidate.length === expected.length && timingSafeEqual(candidate, expected);
  return emailOk && passOk;
}

/** Data Access Layer entry point. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);
  if (!session || session.role !== "admin") return null;
  if (new Date(session.expiresAt) < new Date()) return null;
  return { email: session.email, role: "admin" };
});

/** Pages: redirect to /login when there is no admin session. */
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  return user;
}

/**
 * Server actions and route handlers: throw instead of redirecting. Every
 * mutation must call this; a page-level check does not protect its actions.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
