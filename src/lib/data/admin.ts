import "server-only";
import type { Review } from "@/lib/data/public";

import { db, one, rows } from "@/lib/db";
import { photoWebUrl } from "@/lib/data/galleries";
import type {
  Client,
  ClientStage,
  Gallery,
  Inquiry,
  Order,
  Package,
  Photo,
  PhotoComment,
  PhotoSelection,
  PortfolioImage,
} from "@/lib/types";

/** Admin reads. Callers are already behind requireAdminPage() in the admin layout. */

// ------------------------------------------------------------------ clients

type ClientFlags = {
  unread: number;
  message_count: number;
  has_pending: boolean;
  has_paid: boolean;
  next_shoot: string | null;
  has_proofs: boolean;
  has_finals: boolean;
  open_notes: number;
  favorites: number;
  last_activity: string;
};

export type ClientRow = Client & ClientFlags & { stage: ClientStage; next_step: string };

function stageOf(c: Client & ClientFlags): ClientStage {
  if (c.archived) return "archived";
  if (c.has_finals) return "delivered";
  if (c.has_proofs) return "proofing";
  if (c.has_paid) return "booked";
  if (c.has_pending) return "awaiting_payment";
  return "lead";
}

function nextStepOf(c: Client & ClientFlags, stage: ClientStage): string {
  switch (stage) {
    case "lead":
      return c.message_count ? "Reply and set up a session" : "Set up a session";
    case "awaiting_payment":
      return "Waiting for payment";
    case "booked":
      return c.next_shoot
        ? `Shoot ${new Date(c.next_shoot).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "Upload proofs after the shoot";
    case "proofing":
      if (c.open_notes) return `${c.open_notes} note${c.open_notes === 1 ? "" : "s"} to answer`;
      if (c.favorites) return `${c.favorites} favorite${c.favorites === 1 ? "" : "s"} picked · retouch and deliver`;
      return "Waiting for their picks";
    case "delivered":
      return "Done";
    case "archived":
      return "";
  }
}

const clientRowsSql = () => db()`
  select c.*,
    (select count(*)::int from inquiries i where i.client_id = c.id and i.status = 'new') as unread,
    (select count(*)::int from inquiries i where i.client_id = c.id) as message_count,
    exists (select 1 from orders o where o.client_id = c.id and o.status = 'pending_payment') as has_pending,
    exists (select 1 from orders o where o.client_id = c.id
            and o.status not in ('draft', 'pending_payment', 'cancelled')) as has_paid,
    (select min(o.shoot_date)::text from orders o where o.client_id = c.id and o.shoot_date >= current_date) as next_shoot,
    exists (select 1 from galleries g where g.client_id = c.id and g.kind = 'proof' and g.status = 'published') as has_proofs,
    exists (select 1 from galleries g where g.client_id = c.id and g.kind = 'final' and g.status = 'published') as has_finals,
    (select count(*)::int from photo_comments pc join galleries g on g.id = pc.gallery_id
      where g.client_id = c.id and pc.author_role = 'client' and not pc.resolved) as open_notes,
    (select count(*)::int from photo_selections ps join galleries g on g.id = ps.gallery_id
      where g.client_id = c.id and ps.selected) as favorites,
    greatest(
      c.created_at,
      (select max(i.created_at) from inquiries i where i.client_id = c.id),
      (select max(o.updated_at) from orders o where o.client_id = c.id),
      (select max(g.created_at) from galleries g where g.client_id = c.id)
    ) as last_activity
  from clients c
  order by last_activity desc`;

export async function listClients(): Promise<ClientRow[]> {
  return rows<Client & ClientFlags>(await clientRowsSql()).map((c) => {
    const stage = stageOf(c);
    return { ...c, stage, next_step: nextStepOf(c, stage) };
  });
}

/** Lightweight list for pickers (Galleries page, Lightroom). */
export async function listClientOptions(): Promise<Pick<Client, "id" | "name" | "email">[]> {
  return rows<Pick<Client, "id" | "name" | "email">>(
    await db()`select id, name, email from clients where not archived order by name asc`
  );
}

export type SessionRow = Order & { package: { name: string } | null };

export async function getClient(id: string) {
  const [client, messages, sessions, galleries] = await Promise.all([
    db()`select * from clients where id = ${id} limit 1`,
    db()`select * from inquiries where client_id = ${id} order by created_at desc`,
    db()`
      select o.*, case when p.id is null then null else json_build_object('name', p.name) end as package
      from orders o left join packages p on p.id = o.package_id
      where o.client_id = ${id}
      order by o.created_at desc`,
    db()`
      select g.*,
        (select count(*)::int from photos p where p.gallery_id = g.id) as photo_count,
        (select count(*)::int from photo_selections ps where ps.gallery_id = g.id and ps.selected) as favorites,
        (select count(*)::int from photo_comments pc where pc.gallery_id = g.id
          and pc.author_role = 'client' and not pc.resolved) as open_notes
      from galleries g
      where g.client_id = ${id}
      order by g.created_at desc`,
  ]);
  const c = one<Client>(client);
  if (!c) return null;
  return {
    client: c,
    messages: rows<Inquiry>(messages),
    sessions: rows<SessionRow>(sessions),
    galleries: rows<Gallery & { photo_count: number; favorites: number; open_notes: number }>(galleries),
  };
}

// ---------------------------------------------------------------- galleries

export type GalleryRow = Gallery & {
  client: Pick<Client, "id" | "name" | "email">;
  photo_count: number;
  favorites: number;
  open_notes: number;
};

export async function listGalleries(): Promise<GalleryRow[]> {
  const result = await db()`
    select g.*,
      json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client,
      (select count(*)::int from photos p where p.gallery_id = g.id) as photo_count,
      (select count(*)::int from photo_selections ps where ps.gallery_id = g.id and ps.selected) as favorites,
      (select count(*)::int from photo_comments pc where pc.gallery_id = g.id
        and pc.author_role = 'client' and not pc.resolved) as open_notes
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
        json_build_object('id', c.id, 'name', c.name, 'email', c.email) as client
      from galleries g
      join clients c on c.id = g.client_id
      where g.id = ${id}
      limit 1`,
    db()`select * from photos where gallery_id = ${id} order by sort_order asc, created_at asc`,
    db()`select * from photo_comments where gallery_id = ${id} order by created_at asc`,
    db()`select * from photo_selections where gallery_id = ${id} and selected`,
  ]);

  const g = one<Gallery & { client: Pick<Client, "id" | "name" | "email"> }>(gallery);
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

// ----------------------------------------------------------------- catalog

export async function listPackages(): Promise<Package[]> {
  return rows<Package>(await db()`select * from packages order by sort_order asc`);
}

export async function listPortfolioAdmin(): Promise<PortfolioImage[]> {
  return rows<PortfolioImage>(
    await db()`select * from portfolio_images order by sort_order asc, created_at desc`
  );
}

export async function listReviews(): Promise<Review[]> {
  return rows<Review>(await db()`select * from reviews order by sort_order asc, created_at desc`);
}

export async function getPaidThisMonth(): Promise<{ total_cents: number; count: number }> {
  return (
    one<{ total_cents: number; count: number }>(
      await db()`
        select coalesce(sum(amount_cents), 0)::int as total_cents, count(*)::int as count
        from orders
        where paid_at >= date_trunc('month', now())`
    ) ?? { total_cents: 0, count: 0 }
  );
}
