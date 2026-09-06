import "server-only";

import { db, one, rows } from "@/lib/db";
import { photoWebUrl } from "@/lib/data/galleries";
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

/** Admin reads. Callers are already behind requireAdminPage() in the admin layout. */

export async function getDashboard() {
  const [inq, pend, live, comments, orders] = await Promise.all([
    db()`select count(*)::int as n from inquiries where status = 'new'`,
    db()`select count(*)::int as n from orders where status = 'pending_payment'`,
    db()`select count(*)::int as n from galleries where status = 'published'`,
    db()`
      select c.*,
        json_build_object(
          'filename', p.filename,
          'gallery', json_build_object('id', g.id, 'title', g.title, 'slug', g.slug)
        ) as photo
      from photo_comments c
      join photos p on p.id = c.photo_id
      join galleries g on g.id = c.gallery_id
      where c.author_role = 'client'
      order by c.created_at desc
      limit 8`,
    db()`
      select o.*, json_build_object('name', cl.name) as client
      from orders o join clients cl on cl.id = o.client_id
      order by o.created_at desc
      limit 6`,
  ]);

  return {
    newInquiries: (inq[0]?.n as number) ?? 0,
    pendingOrders: (pend[0]?.n as number) ?? 0,
    activeGalleries: (live[0]?.n as number) ?? 0,
    recentComments: rows<
      PhotoComment & {
        photo: { filename: string; gallery: { id: string; title: string; slug: string } } | null;
      }
    >(comments),
    recentOrders: rows<Order & { client: { name: string } }>(orders),
  };
}

export async function listInquiries(): Promise<Inquiry[]> {
  return rows<Inquiry>(await db()`select * from inquiries order by created_at desc`);
}

export async function listClients(): Promise<Client[]> {
  return rows<Client>(await db()`select * from clients order by name asc`);
}

export async function getClient(id: string) {
  const [client, orders, galleries] = await Promise.all([
    db()`select * from clients where id = ${id} limit 1`,
    db()`select * from orders where client_id = ${id} order by created_at desc`,
    db()`select * from galleries where client_id = ${id} order by created_at desc`,
  ]);
  const c = one<Client>(client);
  if (!c) return null;
  return { client: c, orders: rows<Order>(orders), galleries: rows<Gallery>(galleries) };
}

export type OrderRow = Order & { client: Pick<Client, "id" | "name" | "email"> };

export async function listOrders(status?: OrderStatus): Promise<OrderRow[]> {
  const result = status
    ? await db()`
        select o.*, json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client
        from orders o join clients c on c.id = o.client_id
        where o.status = ${status}
        order by o.created_at desc`
    : await db()`
        select o.*, json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client
        from orders o join clients c on c.id = o.client_id
        order by o.created_at desc`;
  return rows<OrderRow>(result);
}

export async function getOrder(id: string) {
  const [order, galleries] = await Promise.all([
    db()`
      select o.*,
        json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client,
        case when p.id is null then null else json_build_object('name', p.name) end as package
      from orders o
      join clients c on c.id = o.client_id
      left join packages p on p.id = o.package_id
      where o.id = ${id}
      limit 1`,
    db()`select * from galleries where order_id = ${id} order by created_at asc`,
  ]);
  const o = one<OrderRow & { package: { name: string } | null }>(order);
  if (!o) return null;
  return { order: o, galleries: rows<Gallery>(galleries) };
}

export type GalleryRow = Gallery & {
  client: Pick<Client, "id" | "name" | "email">;
  photo_count: number;
};

export async function listGalleries(): Promise<GalleryRow[]> {
  const result = await db()`
    select g.*,
      json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client,
      (select count(*)::int from photos p where p.gallery_id = g.id) as photo_count
    from galleries g join clients c on c.id = g.client_id
    order by g.created_at desc`;
  return rows<GalleryRow>(result);
}

export type AdminPhoto = Photo & {
  url: string;
  selected: boolean;
  comments: PhotoComment[];
};

export async function getGalleryDetail(id: string) {
  const [gallery, photos, comments, selections] = await Promise.all([
    db()`
      select g.*,
        json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client,
        case when o.id is null then null
             else json_build_object('id', o.id, 'order_number', o.order_number, 'title', o.title) end as "order"
      from galleries g
      join clients c on c.id = g.client_id
      left join orders o on o.id = g.order_id
      where g.id = ${id}
      limit 1`,
    db()`select * from photos where gallery_id = ${id} order by sort_order asc, created_at asc`,
    db()`select * from photo_comments where gallery_id = ${id} order by created_at asc`,
    db()`select * from photo_selections where gallery_id = ${id} and selected`,
  ]);

  const g = one<
    Gallery & {
      client: Pick<Client, "id" | "name" | "email">;
      order: { id: string; order_number: number; title: string } | null;
    }
  >(gallery);
  if (!g) return null;

  const selected = new Set(rows<PhotoSelection>(selections).map((s) => s.photo_id));
  const byPhoto = new Map<string, PhotoComment[]>();
  for (const c of rows<PhotoComment>(comments)) {
    byPhoto.set(c.photo_id, [...(byPhoto.get(c.photo_id) ?? []), c]);
  }

  return {
    gallery: g,
    photos: rows<Photo>(photos).map<AdminPhoto>((p) => ({
      ...p,
      url: photoWebUrl(p.id),
      selected: selected.has(p.id),
      comments: byPhoto.get(p.id) ?? [],
    })),
  };
}

export async function listPackages(): Promise<Package[]> {
  return rows<Package>(await db()`select * from packages order by sort_order asc`);
}

export async function listPortfolioAdmin(): Promise<PortfolioImage[]> {
  return rows<PortfolioImage>(
    await db()`select * from portfolio_images order by sort_order asc, created_at desc`
  );
}
