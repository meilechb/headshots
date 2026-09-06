import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Client galleries are protected by an access code rather than an account.
 * A successful check sets an HMAC-signed cookie scoped to that gallery so the
 * client is not asked again for 30 days.
 */

const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

// Unambiguous alphabet: no 0/O or 1/I.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateAccessCode(length = 6) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

export function normalizeCode(code: string) {
  return code.replace(/[\s-]/g, "").toUpperCase();
}

export function verifyAccessCode(code: string, stored: string | null) {
  if (!stored) return false;
  const a = Buffer.from(normalizeCode(code));
  const b = Buffer.from(normalizeCode(stored));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

/** Empty or whitespace-only values count as unset (Vercel keeps blank variables). */
function envValue(name: string) {
  const v = process.env[name]?.trim();
  return v ? v : undefined;
}

const MIN_SECRET_LENGTH = 16;

/**
 * GALLERY_COOKIE_SECRET is optional. A placeholder or too-short value (an old
 * example file used "change-me") is ignored in favour of SESSION_SECRET.
 */
function secret() {
  const own = envValue("GALLERY_COOKIE_SECRET");
  const s = own && own.length >= MIN_SECRET_LENGTH ? own : envValue("SESSION_SECRET");
  if (!s || s.length < MIN_SECRET_LENGTH) {
    throw new Error("SESSION_SECRET must be set (32+ characters) in the environment variables.");
  }
  return `gallery:${s}`;
}

function cookieName(galleryId: string) {
  return `mb_gallery_${galleryId.replace(/-/g, "")}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function grantGalleryAccess(galleryId: string) {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_TTL_SECONDS;
  const payload = `${galleryId}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const store = await cookies();
  store.set(cookieName(galleryId), value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_TTL_SECONDS,
  });
}

export async function revokeGalleryAccess(galleryId: string) {
  const store = await cookies();
  store.delete(cookieName(galleryId));
}

export async function hasGalleryAccess(galleryId: string) {
  const store = await cookies();
  const raw = store.get(cookieName(galleryId))?.value;
  if (!raw) return false;

  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, sig] = parts;
  if (id !== galleryId) return false;
  if (Number(expStr) < Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(`${id}.${expStr}`));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
