"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db, one, rows } from "@/lib/db";
import { generateAccessCode } from "@/lib/gallery-access";
import { deleteBlobs } from "@/lib/storage";
import { describeImageError, downloadBlob, makeWebVersion, putJpeg } from "@/lib/images";
import { generateApiToken, hashApiToken } from "@/lib/api-auth";
import type { ActionState } from "@/lib/action-state";
import type { GalleryKind, GalleryStatus } from "@/lib/types";

/* Every action re-verifies the admin session before touching the database. */

const str = (fd: FormData, key: string, max = 2000) =>
  String(fd.get(key) ?? "").trim().slice(0, max);
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const dollarsToCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, "")) * 100) || 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function fail(message: string): never {
  throw new Error(message);
}

/**
 * Runs a form handler and turns its outcome into ActionState for ActionForm:
 * success → { ok }, a thrown Error → { error: message }. Redirects pass through.
 */
async function run(fn: () => Promise<void>): Promise<ActionState> {
  try {
    await requireAdmin();
    await fn();
    return { ok: true, at: Date.now() };
  } catch (error) {
    unstable_rethrow(error);
    return { error: error instanceof Error ? error.message : "Something went wrong." };
  }
}

function revalidateClient(clientId: string) {
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

// ------------------------------------------------------------------ clients

export async function createClient(_prev: ActionState, formData: FormData) {
  return run(async () => {
    const name = str(formData, "name", 120);
    const email = str(formData, "email", 200);
    if (!name) fail("Name is required.");
    if (!EMAIL_RE.test(email)) fail("Enter a valid email address.");
    const existing = one<{ id: string }>(
      await db()`select id from clients where lower(email) = lower(${email}) limit 1`
    );
    if (existing) fail("A client with this email already exists.");
    const created = one<{ id: string }>(
      await db()`
        insert into clients (name, email, phone, company, notes)
        values (${name}, ${email}, ${str(formData, "phone", 40) || null},
                ${str(formData, "company", 120) || null}, ${str(formData, "notes") || null})
        returning id`
    );
    revalidatePath("/admin/clients");
    redirect(`/admin/clients/${created!.id}`);
  });
}

export async function updateClient(id: string, _prev: ActionState, formData: FormData) {
  return run(async () => {
    const name = str(formData, "name", 120);
    const email = str(formData, "email", 200);
    if (!name) fail("Name is required.");
    if (!EMAIL_RE.test(email)) fail("Enter a valid email address.");
    await db()`
      update clients set
        name = ${name},
        email = ${email},
        phone = ${str(formData, "phone", 40) || null},
        company = ${str(formData, "company", 120) || null},
        notes = ${str(formData, "notes") || null}
      where id = ${id}`;
    revalidateClient(id);
  });
}

export async function setClientArchived(id: string, archived: boolean) {
  await requireAdmin();
  await db()`update clients set archived = ${archived} where id = ${id}`;
  revalidateClient(id);
}

/** Only offered in the UI when the client has no sessions or galleries. */
export async function deleteClient(id: string) {
  await requireAdmin();
  await db()`delete from clients where id = ${id}`;
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

// ----------------------------------------------------------------- messages

/** Opening a client's page marks their contact-form messages as read. */
export async function markMessagesRead(clientId: string) {
  await requireAdmin();
  const changed = rows<{ id: string }>(
    await db()`
      update inquiries set status = 'contacted'
      where client_id = ${clientId} and status = 'new'
      returning id`
  );
  if (changed.length) revalidateClient(clientId);
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  const row = one<{ client_id: string | null }>(
    await db()`delete from inquiries where id = ${id} returning client_id`
  );
  if (row?.client_id) revalidateClient(row.client_id);
  else revalidatePath("/admin/clients");
}

// ----------------------------------------------------------------- sessions
// A "session" in the studio UI is an `orders` row: one shoot with one price.

export async function createSession(clientId: string, _prev: ActionState, formData: FormData) {
  return run(async () => {
    const title = str(formData, "title", 160) || "Headshot session";
    const amount = dollarsToCents(str(formData, "amount", 20));
    if (amount <= 0) fail("Enter a price.");
    const client = one<{ id: string }>(
      await db()`select id from clients where id = ${clientId} limit 1`
    );
    if (!client) fail("Client not found.");
    await db()`
      insert into orders (client_id, package_id, title, description, amount_cents, status, shoot_date, notes)
      values (
        ${clientId},
        ${str(formData, "package_id", 40) || null},
        ${title},
        ${str(formData, "description") || null},
        ${amount},
        'pending_payment',
        ${str(formData, "shoot_date", 10) || null},
        ${str(formData, "notes") || null}
      )`;
    revalidateClient(clientId);
  });
}

export async function updateSession(id: string, _prev: ActionState, formData: FormData) {
  return run(async () => {
    const title = str(formData, "title", 160) || "Headshot session";
    const amount = dollarsToCents(str(formData, "amount", 20));
    if (amount <= 0) fail("Enter a price.");
    const row = one<{ client_id: string }>(
      await db()`
        update orders set
          title = ${title},
          description = ${str(formData, "description") || null},
          amount_cents = ${amount},
          shoot_date = ${str(formData, "shoot_date", 10) || null},
          notes = ${str(formData, "notes") || null},
          updated_at = now()
        where id = ${id}
        returning client_id`
    );
    if (!row) fail("Session not found.");
    revalidateClient(row.client_id);
    revalidatePath(`/pay/${id}`);
  });
}

/** Paid outside Stripe (cash, Zelle, invoice). */
export async function markSessionPaid(id: string) {
  await requireAdmin();
  const row = one<{ client_id: string }>(
    await db()`
      update orders set status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now()
      where id = ${id} and status in ('draft', 'pending_payment')
      returning client_id`
  );
  if (row) revalidateClient(row.client_id);
  revalidatePath(`/pay/${id}`);
}

/** Undo a manual "Mark paid". Stripe payments cannot be undone here. */
export async function markSessionUnpaid(id: string) {
  await requireAdmin();
  const row = one<{ client_id: string }>(
    await db()`
      update orders set status = 'pending_payment', paid_at = null, updated_at = now()
      where id = ${id} and stripe_payment_intent_id is null
      returning client_id`
  );
  if (row) revalidateClient(row.client_id);
  revalidatePath(`/pay/${id}`);
}

export async function deleteSession(id: string) {
  await requireAdmin();
  const row = one<{ client_id: string }>(
    await db()`delete from orders where id = ${id} returning client_id`
  );
  if (row) revalidateClient(row.client_id);
}

// ---------------------------------------------------------------- galleries

async function insertGallery(clientId: string, kind: GalleryKind, title?: string) {
  const client = one<{ name: string }>(
    await db()`select name from clients where id = ${clientId} limit 1`
  );
  if (!client) fail("Client not found.");
  // Attach to the client's most recent session so the two show up together.
  const order = one<{ id: string }>(
    await db()`select id from orders where client_id = ${clientId} order by created_at desc limit 1`
  );
  const label = kind === "proof" ? "Proofs" : "Final photos";
  const slug = `${slugify(client.name)}-${kind === "proof" ? "proofs" : "finals"}-${generateAccessCode(4).toLowerCase()}`;
  const created = one<{ id: string }>(
    await db()`
      insert into galleries (client_id, order_id, title, kind, slug, access_code, allow_downloads, status)
      values (${clientId}, ${order?.id ?? null}, ${title || `${client.name} — ${label}`}, ${kind}, ${slug},
              ${generateAccessCode(6)}, ${kind === "final"}, 'draft')
      returning id`
  );
  revalidateClient(clientId);
  revalidatePath("/admin/galleries");
  return created!.id;
}

/** From the Galleries page: pick a client and a type. */
export async function createGallery(_prev: ActionState, formData: FormData) {
  return run(async () => {
    const clientId = str(formData, "client_id", 40);
    if (!clientId) fail("Choose a client.");
    const kind: GalleryKind = str(formData, "kind") === "final" ? "final" : "proof";
    const id = await insertGallery(clientId, kind, str(formData, "title", 160));
    redirect(`/admin/galleries/${id}`);
  });
}

/** From a client's page: one click, then straight to the upload screen. */
export async function createGalleryForClient(clientId: string, kind: GalleryKind) {
  await requireAdmin();
  const id = await insertGallery(clientId, kind);
  redirect(`/admin/galleries/${id}`);
}

export async function updateGallery(id: string, _prev: ActionState, formData: FormData) {
  return run(async () => {
    const title = str(formData, "title", 160);
    if (!title) fail("Title is required.");
    const expires = str(formData, "expires_at", 10);
    const row = one<{ client_id: string }>(
      await db()`
        update galleries set
          title = ${title},
          kind = ${str(formData, "kind") === "final" ? "final" : "proof"},
          welcome_message = ${str(formData, "welcome_message") || null},
          allow_downloads = ${bool(formData, "allow_downloads")},
          expires_at = ${expires ? new Date(`${expires}T23:59:59`).toISOString() : null}
        where id = ${id}
        returning client_id`
    );
    if (!row) fail("Gallery not found.");
    revalidatePath(`/admin/galleries/${id}`);
    revalidatePath("/admin/galleries");
    revalidateClient(row.client_id);
  });
}

export async function setGalleryStatus(id: string, status: GalleryStatus) {
  await requireAdmin();
  const row = one<{ client_id: string }>(
    await db()`update galleries set status = ${status} where id = ${id} returning client_id`
  );
  revalidatePath(`/admin/galleries/${id}`);
  revalidatePath("/admin/galleries");
  if (row) revalidateClient(row.client_id);
}

export async function regenerateAccessCode(id: string) {
  await requireAdmin();
  await db()`update galleries set access_code = ${generateAccessCode(6)} where id = ${id}`;
  revalidatePath(`/admin/galleries/${id}`);
}

export async function deleteGallery(id: string) {
  await requireAdmin();
  const photos = rows<{ original_url: string; preview_url: string }>(
    await db()`select original_url, preview_url from photos where gallery_id = ${id}`
  );
  await deleteBlobs("galleries", photos.flatMap((p) => [p.original_url, p.preview_url]));
  const row = one<{ client_id: string }>(
    await db()`delete from galleries where id = ${id} returning client_id`
  );
  revalidatePath("/admin/galleries");
  if (row) revalidateClient(row.client_id);
  redirect("/admin/galleries");
}

// ------------------------------------------------------------------- photos

export type BrowserUploadMeta = { url: string; filename: string; size: number };

function assertBlobUrl(url: string, store: "galleries" | "portfolio", prefix: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    fail("Bad upload URL");
  }
  const hostOk = parsed.hostname.endsWith(".blob.vercel-storage.com") &&
    parsed.hostname.includes(store === "galleries" ? ".private." : ".public.");
  if (!hostOk || !parsed.pathname.startsWith(`/${prefix}`)) fail("Upload URL does not belong to this store");
}

/**
 * Browser uploaded the original straight to the private store; the server
 * now makes the web-size preview (any size/format sharp can read) and records
 * the photo.
 */
export async function finalizeGalleryPhoto(galleryId: string, meta: BrowserUploadMeta) {
  await requireAdmin();
  assertBlobUrl(meta.url, "galleries", `galleries/${galleryId}/`);
  let web;
  try {
    web = await makeWebVersion(await downloadBlob(meta.url, "galleries"), 1600);
  } catch (error) {
    await deleteBlobs("galleries", [meta.url]);
    fail(describeImageError(error));
  }
  const base = `${crypto.randomUUID()}`;
  const preview = await putJpeg("galleries", `galleries/${galleryId}/${base}-web.jpg`, web.buffer);
  await db()`
    insert into photos (gallery_id, original_url, preview_url, filename, width, height, size_bytes, sort_order)
    values (
      ${galleryId}, ${meta.url}, ${preview.url}, ${meta.filename.slice(0, 200)},
      ${web.width}, ${web.height}, ${meta.size},
      (select coalesce(max(sort_order), -1) + 1 from photos where gallery_id = ${galleryId})
    )`;
  revalidatePath(`/admin/galleries/${galleryId}`);
}

export async function finalizePortfolioImage(meta: BrowserUploadMeta) {
  await requireAdmin();
  assertBlobUrl(meta.url, "portfolio", "portfolio/incoming/");
  let web;
  try {
    web = await makeWebVersion(await downloadBlob(meta.url, "portfolio"), 2400, 0.88 * 100);
  } catch (error) {
    await deleteBlobs("portfolio", [meta.url]);
    fail(describeImageError(error));
  }
  const stored = await putJpeg("portfolio", `portfolio/${crypto.randomUUID()}.jpg`, web.buffer);
  await deleteBlobs("portfolio", [meta.url]);
  const scale = Math.min(1, 2400 / Math.max(web.width ?? 2400, web.height ?? 2400));
  const alt = meta.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").slice(0, 200);
  await db()`
    insert into portfolio_images (url, alt, width, height, is_published)
    values (${stored.url}, ${alt},
            ${web.width ? Math.round(web.width * scale) : null}, ${web.height ? Math.round(web.height * scale) : null}, true)`;
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

export async function deletePhoto(photoId: string) {
  await requireAdmin();
  const photo = one<{ gallery_id: string; original_url: string; preview_url: string }>(
    await db()`select gallery_id, original_url, preview_url from photos where id = ${photoId} limit 1`
  );
  if (!photo) return;
  await deleteBlobs("galleries", [photo.original_url, photo.preview_url]);
  await db()`delete from photos where id = ${photoId}`;
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function movePhoto(photoId: string, direction: -1 | 1) {
  await requireAdmin();
  const photo = one<{ gallery_id: string }>(
    await db()`select gallery_id from photos where id = ${photoId} limit 1`
  );
  if (!photo) return;
  const ids = rows<{ id: string }>(
    await db()`select id from photos where gallery_id = ${photo.gallery_id} order by sort_order asc, created_at asc`
  ).map((r) => r.id);
  const i = ids.indexOf(photoId);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((id, idx) => db()`update photos set sort_order = ${idx} where id = ${id}`)
  );
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function addAdminComment(photoId: string, formData: FormData) {
  const user = await requireAdmin();
  const body = str(formData, "body", 2000);
  if (!body) return;
  const photo = one<{ gallery_id: string }>(
    await db()`select gallery_id from photos where id = ${photoId} limit 1`
  );
  if (!photo) fail("Photo not found");
  await db()`
    insert into photo_comments (photo_id, gallery_id, author_name, author_role, body)
    values (${photoId}, ${photo.gallery_id}, ${user.email}, 'admin', ${body})`;
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function toggleCommentResolved(commentId: string, resolved: boolean) {
  await requireAdmin();
  const row = one<{ gallery_id: string }>(
    await db()`update photo_comments set resolved = ${resolved} where id = ${commentId} returning gallery_id`
  );
  if (row) revalidatePath(`/admin/galleries/${row.gallery_id}`);
  revalidatePath("/admin/galleries");
  revalidatePath("/admin/clients");
}

// ----------------------------------------------------------------- packages

export async function upsertPackage(_prev: ActionState, formData: FormData) {
  return run(async () => {
    const id = str(formData, "id", 40);
    const name = str(formData, "name", 120);
    if (!name) fail("Name is required.");
    const slug = slugify(str(formData, "slug", 60) || name);
    const description = str(formData, "description") || null;
    const price = dollarsToCents(str(formData, "price", 20));
    const includes = str(formData, "includes", 4000)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const turnaround = str(formData, "turnaround", 80) || null;
    const featured = bool(formData, "is_featured");
    const active = bool(formData, "is_active");
    const sort = Number(str(formData, "sort_order", 6)) || 0;

    if (id) {
      await db()`
        update packages set slug = ${slug}, name = ${name}, description = ${description},
          price_cents = ${price}, includes = ${includes}, turnaround = ${turnaround},
          is_featured = ${featured}, is_active = ${active}, sort_order = ${sort}
        where id = ${id}`;
    } else {
      await db()`
        insert into packages (slug, name, description, price_cents, includes, turnaround, is_featured, is_active, sort_order)
        values (${slug}, ${name}, ${description}, ${price}, ${includes}, ${turnaround}, ${featured}, ${active}, ${sort})`;
    }
    revalidatePath("/admin/packages");
    revalidatePath("/pricing");
    revalidatePath("/");
  });
}

export async function deletePackage(id: string) {
  await requireAdmin();
  await db()`delete from packages where id = ${id}`;
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

// ---------------------------------------------------------------- portfolio

export async function updatePortfolioImage(id: string, _prev: ActionState, formData: FormData) {
  return run(async () => {
    await db()`
      update portfolio_images set
        alt = ${str(formData, "alt", 200)},
        is_featured = ${bool(formData, "is_featured")},
        is_published = ${bool(formData, "is_published")},
        sort_order = ${Number(str(formData, "sort_order", 6)) || 0}
      where id = ${id}`;
    revalidatePath("/admin/portfolio");
    revalidatePath("/");
    revalidatePath("/portfolio");
    revalidatePath("/about");
  });
}

export async function deletePortfolioImage(id: string) {
  await requireAdmin();
  const row = one<{ url: string }>(
    await db()`select url from portfolio_images where id = ${id} limit 1`
  );
  if (row) await deleteBlobs("portfolio", [row.url]);
  await db()`delete from portfolio_images where id = ${id}`;
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

// ------------------------------------------------------------- api tokens

export type TokenState = { token?: string; name?: string; error?: string };

export async function createApiToken(_prev: TokenState, formData: FormData): Promise<TokenState> {
  await requireAdmin();
  const name = str(formData, "name", 80) || "Lightroom";
  const token = generateApiToken();
  await db()`
    insert into api_tokens (name, token_hash, token_prefix)
    values (${name}, ${hashApiToken(token)}, ${token.slice(0, 12)})`;
  revalidatePath("/admin/integrations");
  return { token, name };
}

export async function revokeApiToken(id: string) {
  await requireAdmin();
  await db()`delete from api_tokens where id = ${id}`;
  revalidatePath("/admin/integrations");
}
