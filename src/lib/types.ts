// Row types mirroring db/schema.sql (Neon Postgres).

export type Role = "admin" | "client";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
};

/**
 * Where a client is in the pipeline. Derived from their sessions and
 * galleries, never set by hand (except "archived").
 */
export const clientStages = [
  "lead",
  "awaiting_payment",
  "booked",
  "proofing",
  "delivered",
  "archived",
] as const;
export type ClientStage = (typeof clientStages)[number];

export const clientStageLabels: Record<ClientStage, string> = {
  lead: "New lead",
  awaiting_payment: "Awaiting payment",
  booked: "Booked",
  proofing: "Proofs out",
  delivered: "Delivered",
  archived: "Archived",
};

export type Package = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  includes: string[];
  turnaround: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

export type InquiryStatus = "new" | "contacted" | "booked" | "closed";

export type Inquiry = {
  id: string;
  client_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  package_slug: string | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
};

export const orderStatuses = [
  "draft",
  "pending_payment",
  "paid",
  "scheduled",
  "editing",
  "proofing",
  "final_delivered",
  "completed",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  pending_payment: "Awaiting payment",
  paid: "Paid",
  scheduled: "Session scheduled",
  editing: "Editing",
  proofing: "Proofs sent",
  final_delivered: "Final delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export type Order = {
  id: string;
  order_number: number;
  client_id: string;
  package_id: string | null;
  title: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  shoot_date: string | null;
  notes: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GalleryKind = "proof" | "final";
export type GalleryStatus = "draft" | "published" | "archived";

export const galleryKindLabels: Record<GalleryKind, string> = {
  proof: "Proofs",
  final: "Final photos",
};

/** What the studio sees. "Live" means the client can open it. */
export const galleryStatusLabels: Record<GalleryStatus, string> = {
  draft: "Draft",
  published: "Live",
  archived: "Closed",
};

export type Gallery = {
  id: string;
  order_id: string | null;
  client_id: string;
  slug: string;
  title: string;
  kind: GalleryKind;
  status: GalleryStatus;
  access_code: string | null;
  allow_downloads: boolean;
  welcome_message: string | null;
  expires_at: string | null;
  source: "web" | "lightroom";
  created_at: string;
};

export type ApiToken = {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

export type Photo = {
  id: string;
  gallery_id: string;
  original_url: string;
  preview_url: string;
  lr_photo_id: string | null;
  filename: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  sort_order: number;
  created_at: string;
};

export type PhotoComment = {
  id: string;
  photo_id: string;
  gallery_id: string;
  author_name: string;
  author_role: Role;
  body: string;
  resolved: boolean;
  created_at: string;
};

export type PhotoSelection = {
  photo_id: string;
  gallery_id: string;
  selected: boolean;
  updated_at: string;
};

export type PortfolioImage = {
  id: string;
  url: string;
  alt: string;
  category: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
};

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
