"use server";

import { revalidatePath } from "next/cache";
import { site } from "@/lib/site";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured, sendEmail } from "@/lib/email";
import { galleryReadyEmail } from "@/lib/emails";
import { db, one, rows } from "@/lib/db";
import { generateAccessCode, normalizeCode } from "@/lib/gallery-access";
import { deleteBlobs } from "@/lib/storage";
import { describeImageError, downloadBlob, makeWebVersion, putJpeg } from "@/lib/images";
import { generateApiToken, hashApiToken } from "@/lib/api-auth";
import { orderStatuses, type OrderStatus } from "@/lib/types";

/* Every action re-verifies the admin session before touching the database. */

const str = (fd: FormData, key: string, max = 2000) =>
  String(fd.get(key) ?? "").trim().slice(0, max);
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const dollarsToCents = (v: string) => Math.round(Number(v.replace(/[^0-9.]/g, "")) * 100) || 0;

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

// ---------------------------------------------------------------- inquiries

export async function updateInquiryStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status");
  if (!["new", "contacted", "booked", "closed"].includes(status)) fail("Bad status");
  await db()`update inquiries set status = ${status}, updated_at = now() where id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function convertInquiryToClient(id: string) {
  await requireAdmin();
  const inq = one<{
    name: string; email: string; phone: string | null; package_slug: string | null; message: string | null;
  }>(await db()`select * from inquiries where id = ${id} limit 1`);
  if (!inq) fail("Inquiry not found");

  const existing = one<{ id: string }>(
    await db()`select id from clients where lower(email) = lower(${inq.email}) limit 1`
  );

  let clientId = existing?.id;
  if (!clientId) {
    const notes =
      [inq.package_slug ? `Interested in: ${inq.package_slug}` : null, inq.message]
        .filter(Boolean)
        .join("\n\n") || null;
    const created = one<{ id: string }>(
      await db()`
        insert into clients (name, email, phone, notes)
        values (${inq.name}, ${inq.email}, ${inq.phone}, ${notes})
        returning id`
    );
    clientId = created!.id;
  }

  await db()`update inquiries set status = 'contacted', updated_at = now() where id = ${id}`;
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${clientId}`);
}

export async function updateInquiryNotes(id: string, formData: FormData) {
  await requireAdmin();
  const notes = str(formData, "notes", 4000);
  await db()`update inquiries set notes = ${notes || null}, updated_at = now() where id = ${id}`;
  revalidatePath("/admin/inquiries");
}

export async function setInquiryStatus(id: string, status: string) {
  await requireAdmin();
  if (!["new", "contacted", "booked", "closed"].includes(status)) fail("Bad status");
  await db()`update inquiries set status = ${status}, updated_at = now() where id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  await db()`delete from inquiries where id = ${id}`;
  revalidatePath("/admin/inquiries");
}

// ------------------------------------------------------------------ clients

export async function createClientRecord(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name", 120);
  const email = str(formData, "email", 200);
  if (!name || !email) fail("Name and email are required");
  const created = one<{ id: string }>(
    await db()`
      insert into clients (name, email, phone, company, notes)
      values (${name}, ${email}, ${str(formData, "phone", 40) || null},
              ${str(formData, "company", 120) || null}, ${str(formData, "notes") || null})
      returning id`
  );
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${created!.id}`);
}

export async function updateClientRecord(id: string, formData: FormData) {
  await requireAdmin();
  await db()`
    update clients set
      name = ${str(formData, "name", 120)},
      email = ${str(formData, "email", 200)},
      phone = ${str(formData, "phone", 40) || null},
      company = ${str(formData, "company", 120) || null},
      notes = ${str(formData, "notes") || null}
    where id = ${id}`;
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/clients");
}

export async function deleteClientRecord(id: string) {
  await requireAdmin();
  try {
    await db()`delete from clients where id = ${id}`;
  } catch {
    fail("Delete this client’s orders and galleries first.");
  }
  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}

// ------------------------------------------------------------------- orders

export async function createOrder(formData: FormData) {
  await requireAdmin();
  const clientId = str(formData, "client_id", 40);
  const title = str(formData, "title", 160);
  if (!clientId || !title) fail("Client and title are required");
  const status = str(formData, "status") as OrderStatus;
  const created = one<{ id: string }>(
    await db()`
      insert into orders (client_id, package_id, title, description, amount_cents, status, shoot_date, notes)
      values (
        ${clientId},
        ${str(formData, "package_id", 40) || null},
        ${title},
        ${str(formData, "description") || null},
        ${dollarsToCents(str(formData, "amount", 20))},
        ${orderStatuses.includes(status) ? status : "pending_payment"},
        ${str(formData, "shoot_date", 10) || null},
        ${str(formData, "notes") || null}
      )
      returning id`
  );
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${created!.id}`);
}

export async function updateOrder(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status") as OrderStatus;
  await db()`
    update orders set
      title = ${str(formData, "title", 160)},
      description = ${str(formData, "description") || null},
      amount_cents = ${dollarsToCents(str(formData, "amount", 20))},
      status = coalesce(${orderStatuses.includes(status) ? status : null}, status),
      shoot_date = ${str(formData, "shoot_date", 10) || null},
      notes = ${str(formData, "notes") || null},
      updated_at = now()
    where id = ${id}`;
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/pay/${id}`);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!orderStatuses.includes(status)) fail("Bad status");
  await db()`update orders set status = ${status}, updated_at = now() where id = ${id}`;
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath(`/pay/${id}`);
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  await db()`delete from orders where id = ${id}`;
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

// ---------------------------------------------------------------- galleries

export async function createGallery(formData: FormData) {
  await requireAdmin();
  const clientId = str(formData, "client_id", 40);
  const title = str(formData, "title", 160);
  const kind = str(formData, "kind") === "final" ? "final" : "proof";
  if (!clientId || !title) fail("Client and title are required");

  const client = one<{ name: string }>(
    await db()`select name from clients where id = ${clientId} limit 1`
  );
  if (!client) fail("Client not found");

  const slug = `${slugify(client.name)}-${kind === "proof" ? "proofs" : "finals"}-${generateAccessCode(4).toLowerCase()}`;
  const created = one<{ id: string }>(
    await db()`
      insert into galleries (client_id, order_id, title, kind, slug, access_code, allow_downloads, status)
      values (${clientId}, ${str(formData, "order_id", 40) || null}, ${title}, ${kind}, ${slug},
              ${generateAccessCode(6)}, ${kind === "final"}, 'draft')
      returning id`
  );
  revalidatePath("/admin/galleries");
  redirect(`/admin/galleries/${created!.id}`);
}

export async function updateGallery(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status");
  const expires = str(formData, "expires_at", 10);
  await db()`
    update galleries set
      title = ${str(formData, "title", 160)},
      kind = ${str(formData, "kind") === "final" ? "final" : "proof"},
      welcome_message = ${str(formData, "welcome_message") || null},
      allow_downloads = ${bool(formData, "allow_downloads")},
      expires_at = ${expires ? new Date(`${expires}T23:59:59`).toISOString() : null},
      status = coalesce(${["draft", "published", "archived"].includes(status) ? status : null}, status)
    where id = ${id}`;
  revalidatePath(`/admin/galleries/${id}`);
  revalidatePath("/admin/galleries");
}

export async function setGalleryStatus(id: string, status: "draft" | "published" | "archived") {
  await requireAdmin();
  await db()`update galleries set status = ${status} where id = ${id}`;
  revalidatePath(`/admin/galleries/${id}`);
  revalidatePath("/admin/galleries");
}

export async function regenerateAccessCode(id: string) {
  await requireAdmin();
  await db()`update galleries set access_code = ${generateAccessCode(6)} where id = ${id}`;
  revalidatePath(`/admin/galleries/${id}`);
}

export async function setAccessCode(id: string, formData: FormData) {
  await requireAdmin();
  const code = normalizeCode(str(formData, "access_code", 32));
  if (code.length < 4) fail("Code must be at least 4 characters");
  await db()`update galleries set access_code = ${code} where id = ${id}`;
  revalidatePath(`/admin/galleries/${id}`);
}

export async function deleteGallery(id: string) {
  await requireAdmin();
  const photos = rows<{ original_url: string; preview_url: string }>(
    await db()`select original_url, preview_url from photos where gallery_id = ${id}`
  );
  await deleteBlobs("galleries", photos.flatMap((p) => [p.original_url, p.preview_url]));
  await db()`delete from galleries where id = ${id}`;
  revalidatePath("/admin/galleries");
  redirect("/admin/galleries");
}

export type UploadedPhotoMeta = {
  originalUrl: string;
  previewUrl: string;
  filename: string;
  width: number | null;
  height: number | null;
  size: number;
};

export async function registerGalleryPhoto(galleryId: string, meta: UploadedPhotoMeta) {
  await requireAdmin();
  if (!meta.originalUrl.startsWith("https://") || !meta.previewUrl.startsWith("https://")) {
    fail("Bad blob URL");
  }
  await db()`
    insert into photos (gallery_id, original_url, preview_url, filename, width, height, size_bytes, sort_order)
    values (
      ${galleryId}, ${meta.originalUrl}, ${meta.previewUrl}, ${meta.filename.slice(0, 200)},
      ${meta.width}, ${meta.height}, ${meta.size},
      (select coalesce(max(sort_order), -1) + 1 from photos where gallery_id = ${galleryId})
    )`;
  revalidatePath(`/admin/galleries/${galleryId}`);
}

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
 * the photo. Replaces the old browser-side canvas resizing, which failed on
 * large files in some browsers.
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

export async function finalizePortfolioImage(meta: BrowserUploadMeta & { category: string }) {
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
    insert into portfolio_images (url, alt, category, width, height, is_published)
    values (${stored.url}, ${alt}, ${meta.category.slice(0, 40)},
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
  revalidatePath("/admin");
}

// ----------------------------------------------------------------- packages

export async function upsertPackage(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 40);
  const name = str(formData, "name", 120);
  if (!name) fail("Name is required");
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
}

export async function deletePackage(id: string) {
  await requireAdmin();
  await db()`delete from packages where id = ${id}`;
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

// ---------------------------------------------------------------- portfolio

export type UploadedPortfolioMeta = {
  url: string;
  filename: string;
  width: number | null;
  height: number | null;
  category: string;
};

export async function registerPortfolioImage(meta: UploadedPortfolioMeta) {
  await requireAdmin();
  if (!meta.url.startsWith("https://")) fail("Bad blob URL");
  const alt = meta.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").slice(0, 200);
  await db()`
    insert into portfolio_images (url, alt, category, width, height, is_published)
    values (${meta.url}, ${alt}, ${meta.category.slice(0, 40)}, ${meta.width}, ${meta.height}, true)`;
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

export async function updatePortfolioImage(id: string, formData: FormData) {
  await requireAdmin();
  await db()`
    update portfolio_images set
      alt = ${str(formData, "alt", 200)},
      category = ${str(formData, "category", 40)},
      is_featured = ${bool(formData, "is_featured")},
      is_published = ${bool(formData, "is_published")},
      sort_order = ${Number(str(formData, "sort_order", 6)) || 0}
    where id = ${id}`;
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/about");
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

// ------------------------------------------------------------- gallery email

export type GalleryEmailState = { ok?: boolean; error?: string };

/** Emails the gallery link and access code to the client (requires RESEND_API_KEY). */
export async function emailGalleryLink(galleryId: string): Promise<GalleryEmailState> {
  await requireAdmin();
  if (!emailConfigured()) return { error: "Email is not set up yet. Use the mail-app button instead." };
  const g = one<{
    slug: string; kind: "proof" | "final"; access_code: string | null; expires_at: string | null; status: string;
    client_name: string; client_email: string;
  }>(
    await db()`
      select g.slug, g.kind, g.access_code, g.expires_at, g.status, c.name as client_name, c.email as client_email
      from galleries g join clients c on c.id = g.client_id
      where g.id = ${galleryId} limit 1`
  );
  if (!g) return { error: "Gallery not found." };
  if (g.status !== "published") return { error: "Publish the gallery first so the link works." };
  if (!g.access_code) return { error: "The gallery has no access code." };
  const mail = galleryReadyEmail({
    clientName: g.client_name,
    kind: g.kind,
    link: `${site.url}/g/${g.slug}`,
    code: g.access_code,
    expiresAt: g.expires_at,
  });
  const result = await sendEmail({ to: g.client_email, subject: mail.subject, text: mail.text });
  if (!result.ok) return { error: result.error ?? "Sending failed." };
  return { ok: true };
}
