"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { generateAccessCode, normalizeCode } from "@/lib/gallery-access";
import { createClient } from "@/lib/supabase/server";
import { orderStatuses, type OrderStatus } from "@/lib/types";

/*
 * Every action re-verifies the admin role, then uses the admin's own session
 * so Postgres RLS applies as a second layer.
 */

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
  const supabase = await createClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
}

export async function convertInquiryToClient(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: inq } = await supabase.from("inquiries").select("*").eq("id", id).maybeSingle();
  if (!inq) fail("Inquiry not found");

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .ilike("email", inq.email)
    .maybeSingle();

  let clientId = existing?.id as string | undefined;
  if (!clientId) {
    const { data: created, error } = await supabase
      .from("clients")
      .insert({
        name: inq.name,
        email: inq.email,
        phone: inq.phone,
        notes: [inq.package_slug ? `Interested in: ${inq.package_slug}` : null, inq.message]
          .filter(Boolean)
          .join("\n\n") || null,
      })
      .select("id")
      .single();
    if (error) fail(error.message);
    clientId = created.id;
  }

  await supabase.from("inquiries").update({ status: "contacted" }).eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${clientId}`);
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("inquiries").delete().eq("id", id);
  revalidatePath("/admin/inquiries");
}

// ------------------------------------------------------------------ clients

export async function createClientRecord(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name", 120);
  const email = str(formData, "email", 200);
  if (!name || !email) fail("Name and email are required");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      email,
      phone: str(formData, "phone", 40) || null,
      company: str(formData, "company", 120) || null,
      notes: str(formData, "notes") || null,
    })
    .select("id")
    .single();
  if (error) fail(error.message);
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${data.id}`);
}

export async function updateClientRecord(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      name: str(formData, "name", 120),
      email: str(formData, "email", 200),
      phone: str(formData, "phone", 40) || null,
      company: str(formData, "company", 120) || null,
      notes: str(formData, "notes") || null,
    })
    .eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin/clients");
}

export async function deleteClientRecord(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) fail("Delete this client’s orders and galleries first.");
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      client_id: clientId,
      package_id: str(formData, "package_id", 40) || null,
      title,
      description: str(formData, "description") || null,
      amount_cents: dollarsToCents(str(formData, "amount", 20)),
      status: orderStatuses.includes(status) ? status : "pending_payment",
      shoot_date: str(formData, "shoot_date", 10) || null,
      notes: str(formData, "notes") || null,
    })
    .select("id")
    .single();
  if (error) fail(error.message);
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${data.id}`);
}

export async function updateOrder(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status") as OrderStatus;
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({
      title: str(formData, "title", 160),
      description: str(formData, "description") || null,
      amount_cents: dollarsToCents(str(formData, "amount", 20)),
      status: orderStatuses.includes(status) ? status : undefined,
      shoot_date: str(formData, "shoot_date", 10) || null,
      notes: str(formData, "notes") || null,
    })
    .eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/pay/${id}`);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!orderStatuses.includes(status)) fail("Bad status");
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath(`/pay/${id}`);
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
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

  const supabase = await createClient();
  const { data: client } = await supabase.from("clients").select("name").eq("id", clientId).maybeSingle();
  if (!client) fail("Client not found");

  const slug = `${slugify(client.name)}-${kind === "proof" ? "proofs" : "finals"}-${generateAccessCode(4).toLowerCase()}`;

  const { data, error } = await supabase
    .from("galleries")
    .insert({
      client_id: clientId,
      order_id: str(formData, "order_id", 40) || null,
      title,
      kind,
      slug,
      access_code: generateAccessCode(6),
      allow_downloads: kind === "final",
      status: "draft",
    })
    .select("id")
    .single();
  if (error) fail(error.message);
  revalidatePath("/admin/galleries");
  redirect(`/admin/galleries/${data.id}`);
}

export async function updateGallery(id: string, formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status");
  const expires = str(formData, "expires_at", 10);
  const supabase = await createClient();
  const { error } = await supabase
    .from("galleries")
    .update({
      title: str(formData, "title", 160),
      kind: str(formData, "kind") === "final" ? "final" : "proof",
      welcome_message: str(formData, "welcome_message") || null,
      allow_downloads: bool(formData, "allow_downloads"),
      expires_at: expires ? new Date(`${expires}T23:59:59`).toISOString() : null,
      status: ["draft", "published", "archived"].includes(status) ? status : undefined,
    })
    .eq("id", id);
  if (error) fail(error.message);
  revalidatePath(`/admin/galleries/${id}`);
  revalidatePath("/admin/galleries");
}

export async function setGalleryStatus(id: string, status: "draft" | "published" | "archived") {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("galleries").update({ status }).eq("id", id);
  revalidatePath(`/admin/galleries/${id}`);
  revalidatePath("/admin/galleries");
}

export async function regenerateAccessCode(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("galleries").update({ access_code: generateAccessCode(6) }).eq("id", id);
  revalidatePath(`/admin/galleries/${id}`);
}

export async function setAccessCode(id: string, formData: FormData) {
  await requireAdmin();
  const code = normalizeCode(str(formData, "access_code", 32));
  if (code.length < 4) fail("Code must be at least 4 characters");
  const supabase = await createClient();
  await supabase.from("galleries").update({ access_code: code }).eq("id", id);
  revalidatePath(`/admin/galleries/${id}`);
}

export async function deleteGallery(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: photos } = await supabase.from("photos").select("storage_path").eq("gallery_id", id);
  const paths = (photos ?? []).map((p) => p.storage_path);
  if (paths.length) await supabase.storage.from("galleries").remove(paths);
  await supabase.from("galleries").delete().eq("id", id);
  revalidatePath("/admin/galleries");
  redirect("/admin/galleries");
}

export type UploadedFileMeta = {
  path: string;
  filename: string;
  width: number | null;
  height: number | null;
  size: number;
};

export async function registerGalleryPhoto(galleryId: string, meta: UploadedFileMeta) {
  await requireAdmin();
  if (!meta.path.startsWith(`${galleryId}/`)) fail("Path does not belong to gallery");
  const supabase = await createClient();
  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("gallery_id", galleryId);
  const { error } = await supabase.from("photos").insert({
    gallery_id: galleryId,
    storage_path: meta.path,
    filename: meta.filename.slice(0, 200),
    width: meta.width,
    height: meta.height,
    size_bytes: meta.size,
    sort_order: count ?? 0,
  });
  if (error) fail(error.message);
  revalidatePath(`/admin/galleries/${galleryId}`);
}

export async function deletePhoto(photoId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: photo } = await supabase
    .from("photos")
    .select("gallery_id, storage_path")
    .eq("id", photoId)
    .maybeSingle();
  if (!photo) return;
  await supabase.storage.from("galleries").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", photoId);
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function movePhoto(photoId: string, direction: -1 | 1) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: photo } = await supabase.from("photos").select("gallery_id").eq("id", photoId).maybeSingle();
  if (!photo) return;
  const { data: all } = await supabase
    .from("photos")
    .select("id")
    .eq("gallery_id", photo.gallery_id)
    .order("sort_order")
    .order("created_at");
  const ids = (all ?? []).map((p) => p.id);
  const i = ids.indexOf(photoId);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((id, idx) => supabase.from("photos").update({ sort_order: idx }).eq("id", id))
  );
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function addAdminComment(photoId: string, formData: FormData) {
  const user = await requireAdmin();
  const body = str(formData, "body", 2000);
  if (!body) return;
  const supabase = await createClient();
  const { data: photo } = await supabase.from("photos").select("gallery_id").eq("id", photoId).maybeSingle();
  if (!photo) fail("Photo not found");
  await supabase.from("photo_comments").insert({
    photo_id: photoId,
    gallery_id: photo.gallery_id,
    author_name: user.email ?? "Photographer",
    author_role: "admin",
    body,
  });
  revalidatePath(`/admin/galleries/${photo.gallery_id}`);
}

export async function toggleCommentResolved(commentId: string, resolved: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("photo_comments")
    .update({ resolved })
    .eq("id", commentId)
    .select("gallery_id")
    .maybeSingle();
  if (data) revalidatePath(`/admin/galleries/${data.gallery_id}`);
  revalidatePath("/admin");
}

// ----------------------------------------------------------------- packages

export async function upsertPackage(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 40);
  const name = str(formData, "name", 120);
  if (!name) fail("Name is required");
  const row = {
    slug: slugify(str(formData, "slug", 60) || name),
    name,
    description: str(formData, "description") || null,
    price_cents: dollarsToCents(str(formData, "price", 20)),
    includes: str(formData, "includes", 4000)
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    turnaround: str(formData, "turnaround", 80) || null,
    is_featured: bool(formData, "is_featured"),
    is_active: bool(formData, "is_active"),
    sort_order: Number(str(formData, "sort_order", 6)) || 0,
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("packages").update(row).eq("id", id)
    : await supabase.from("packages").insert(row);
  if (error) fail(error.message);
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
  revalidatePath("/");
}

export async function deletePackage(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("packages").delete().eq("id", id);
  revalidatePath("/admin/packages");
  revalidatePath("/pricing");
}

// ---------------------------------------------------------------- portfolio

export async function registerPortfolioImage(meta: UploadedFileMeta & { category: string }) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("portfolio_images").insert({
    storage_path: meta.path,
    alt: meta.filename.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").slice(0, 200),
    category: meta.category.slice(0, 40),
    width: meta.width,
    height: meta.height,
    is_published: true,
  });
  if (error) fail(error.message);
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
}

export async function updatePortfolioImage(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("portfolio_images")
    .update({
      alt: str(formData, "alt", 200),
      category: str(formData, "category", 40),
      is_featured: bool(formData, "is_featured"),
      is_published: bool(formData, "is_published"),
      sort_order: Number(str(formData, "sort_order", 6)) || 0,
    })
    .eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
  revalidatePath("/about");
}

export async function deletePortfolioImage(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("portfolio_images").select("storage_path").eq("id", id).maybeSingle();
  if (data) await supabase.storage.from("portfolio").remove([data.storage_path]);
  await supabase.from("portfolio_images").delete().eq("id", id);
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  revalidatePath("/portfolio");
}
