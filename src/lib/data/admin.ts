import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Client,
  Gallery,
  Inquiry,
  Order,
  OrderStatus,
  Package,
  Photo,
  PhotoComment,
  PhotoSelection,
  PortfolioImage,
} from "@/lib/types";

/**
 * Admin reads. These use the signed-in admin's own session, so Row Level
 * Security (profiles.role = 'admin') is enforced by Postgres.
 */

export async function getDashboard() {
  const supabase = await createClient();
  const [inquiries, pendingOrders, activeGalleries, recentComments, recentOrders] =
    await Promise.all([
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
      supabase.from("galleries").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase
        .from("photo_comments")
        .select("*, photo:photos(filename, gallery:galleries(id, title, slug))")
        .eq("author_role", "client")
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("orders")
        .select("*, client:clients(name)")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return {
    newInquiries: inquiries.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    activeGalleries: activeGalleries.count ?? 0,
    recentComments: (recentComments.data ?? []) as unknown as (PhotoComment & {
      photo: { filename: string; gallery: { id: string; title: string; slug: string } | null } | null;
    })[],
    recentOrders: (recentOrders.data ?? []) as unknown as (Order & { client: { name: string } })[],
  };
}

export async function listInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Inquiry[] | null) ?? [];
}

export async function listClients(): Promise<Client[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("name");
  return (data as Client[] | null) ?? [];
}

export async function getClient(id: string) {
  const supabase = await createClient();
  const [{ data: client }, { data: orders }, { data: galleries }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    supabase.from("galleries").select("*").eq("client_id", id).order("created_at", { ascending: false }),
  ]);
  if (!client) return null;
  return {
    client: client as Client,
    orders: (orders as Order[] | null) ?? [],
    galleries: (galleries as Gallery[] | null) ?? [],
  };
}

export type OrderRow = Order & { client: Pick<Client, "id" | "name" | "email"> };

export async function listOrders(status?: OrderStatus): Promise<OrderRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("orders")
    .select("*, client:clients(id, name, email)")
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return ((data ?? []) as unknown as OrderRow[]);
}

export async function getOrder(id: string) {
  const supabase = await createClient();
  const [{ data: order }, { data: galleries }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, client:clients(id, name, email), package:packages(name)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("galleries").select("*").eq("order_id", id).order("created_at"),
  ]);
  if (!order) return null;
  return {
    order: order as unknown as OrderRow & { package: { name: string } | null },
    galleries: (galleries as Gallery[] | null) ?? [],
  };
}

export type GalleryRow = Gallery & {
  client: Pick<Client, "id" | "name" | "email">;
  photo_count: { count: number }[];
};

export async function listGalleries(): Promise<GalleryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*, client:clients(id, name, email), photo_count:photos(count)")
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as GalleryRow[]);
}

export type AdminPhoto = Photo & {
  url: string;
  selected: boolean;
  comments: PhotoComment[];
};

export async function getGalleryDetail(id: string) {
  const supabase = await createClient();
  const [{ data: gallery }, { data: photos }, { data: comments }, { data: selections }] =
    await Promise.all([
      supabase
        .from("galleries")
        .select("*, client:clients(id, name, email), order:orders(id, order_number, title)")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("photos")
        .select("*")
        .eq("gallery_id", id)
        .order("sort_order")
        .order("created_at"),
      supabase.from("photo_comments").select("*").eq("gallery_id", id).order("created_at"),
      supabase.from("photo_selections").select("*").eq("gallery_id", id),
    ]);
  if (!gallery) return null;

  const list = (photos as Photo[] | null) ?? [];
  const urls = new Map<string, string>();
  if (list.length) {
    const { data: signed } = await supabase.storage
      .from("galleries")
      .createSignedUrls(list.map((p) => p.storage_path), 60 * 60);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
    }
  }
  const selected = new Set(
    ((selections as PhotoSelection[] | null) ?? []).filter((s) => s.selected).map((s) => s.photo_id)
  );
  const byPhoto = new Map<string, PhotoComment[]>();
  for (const c of (comments as PhotoComment[] | null) ?? []) {
    byPhoto.set(c.photo_id, [...(byPhoto.get(c.photo_id) ?? []), c]);
  }

  return {
    gallery: gallery as unknown as Gallery & {
      client: Pick<Client, "id" | "name" | "email">;
      order: { id: string; order_number: number; title: string } | null;
    },
    photos: list.map<AdminPhoto>((p) => ({
      ...p,
      url: urls.get(p.storage_path) ?? "",
      selected: selected.has(p.id),
      comments: byPhoto.get(p.id) ?? [],
    })),
  };
}

export async function listPackages(): Promise<Package[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("packages").select("*").order("sort_order");
  return (data as Package[] | null) ?? [];
}

export async function listPortfolioAdmin(): Promise<(PortfolioImage & { url: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolio_images")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  return ((data as PortfolioImage[] | null) ?? []).map((img) => ({
    ...img,
    url: supabase.storage.from("portfolio").getPublicUrl(img.storage_path).data.publicUrl,
  }));
}
