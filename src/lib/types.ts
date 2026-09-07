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
  /** Finals included in the price. 0 means no limit and no extra charge. */
  included_finals: number;
  /** Price of each pick above included_finals. */
  extra_final_cents: number;
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
  session_type: string | null;
  people_count: number | null;
  timing: string | null;
  location_pref: string | null;
  town: string | null;
  source: string | null;
  notes: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
};

export const sessionTypes = [
  { value: "individual", label: "Headshot for myself (business / LinkedIn)" },
  { value: "team", label: "Headshots for a team or office" },
  { value: "real-estate", label: "Real estate / sales photos" },
  { value: "medical", label: "Medical or professional practice" },
  { value: "actor", label: "Actor headshots" },
  { value: "other", label: "Something else" },
] as const;

export const locationPrefs = [
  { value: "studio", label: "Your studio in Spring Valley" },
  { value: "on-site", label: "At my office or location" },
  { value: "either", label: "Either / not sure" },
] as const;

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
  /** Set once the whole balance is paid. */
  paid_at: string | null;
  deposit_cents: number;
  included_finals: number;
  extra_final_cents: number;
  contract_version: string | null;
  contract_signed_at: string | null;
  contract_signed_name: string | null;
  contract_signed_ip: string | null;
  contract_portfolio_ok: boolean | null;
  created_at: string;
  updated_at: string;
};

export type PaymentKind = "deposit" | "balance" | "full" | "manual";

export type Payment = {
  id: string;
  order_id: string;
  kind: PaymentKind;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid";
  method: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
};

/** Money summary for one session: what it costs, what is paid, what is left. */
export type OrderMoney = {
  price_cents: number;
  picks: number;
  extra_picks: number;
  extras_cents: number;
  total_cents: number;
  paid_cents: number;
  due_cents: number;
  deposit_cents: number;
  deposit_due_cents: number;
  deposit_paid: boolean;
  fully_paid: boolean;
};

export function orderMoney(
  order: Pick<Order, "amount_cents" | "deposit_cents" | "included_finals" | "extra_final_cents">,
  payments: Pick<Payment, "amount_cents" | "status">[],
  picks: number
): OrderMoney {
  const extra_picks =
    order.included_finals > 0 && order.extra_final_cents > 0 ? Math.max(0, picks - order.included_finals) : 0;
  const extras_cents = extra_picks * order.extra_final_cents;
  const total_cents = order.amount_cents + extras_cents;
  const paid_cents = payments.filter((p) => p.status === "paid").reduce((n, p) => n + p.amount_cents, 0);
  const due_cents = Math.max(0, total_cents - paid_cents);
  const deposit_cents = Math.min(order.deposit_cents, total_cents);
  return {
    price_cents: order.amount_cents,
    picks,
    extra_picks,
    extras_cents,
    total_cents,
    paid_cents,
    due_cents,
    deposit_cents,
    deposit_due_cents: Math.max(0, deposit_cents - paid_cents),
    deposit_paid: paid_cents >= deposit_cents,
    fully_paid: due_cents === 0,
  };
}

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
