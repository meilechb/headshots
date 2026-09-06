-- Meilech Biller Headshot Photography — Neon Postgres schema
-- Apply with `npm run db:migrate` (reads DATABASE_URL) or paste into the Neon SQL Editor.
-- Statements are separated by a line containing only ";" is not required; the migrate
-- script splits on semicolons at end of line, so keep one statement per block.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  includes text[] not null default '{}',
  turnaround text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  package_slug text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  created_at timestamptz not null default now()
);

-- Inquiry details added later; safe to re-run.
alter table inquiries add column if not exists session_type text;
alter table inquiries add column if not exists people_count integer;
alter table inquiries add column if not exists timing text;
alter table inquiries add column if not exists location_pref text;
alter table inquiries add column if not exists town text;
alter table inquiries add column if not exists source text;
alter table inquiries add column if not exists notes text;
alter table inquiries add column if not exists updated_at timestamptz not null default now();

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default nextval('order_number_seq') unique,
  client_id uuid not null references clients (id) on delete restrict,
  package_id uuid references packages (id) on delete set null,
  title text not null,
  description text,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'draft' check (status in (
    'draft', 'pending_payment', 'paid', 'scheduled', 'editing',
    'proofing', 'final_delivered', 'completed', 'cancelled'
  )),
  shoot_date date,
  notes text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists galleries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete set null,
  client_id uuid not null references clients (id) on delete restrict,
  slug text not null unique,
  title text not null,
  kind text not null check (kind in ('proof', 'final')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  access_code text,
  allow_downloads boolean not null default false,
  welcome_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Two blobs per photo in the private store: the original for downloads and a
-- web-size preview (max 1600px) for browsing. Both are streamed through
-- /api/photo/[id] after an access check.
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references galleries (id) on delete cascade,
  original_url text not null unique,
  preview_url text not null,
  filename text not null,
  width integer,
  height integer,
  size_bytes bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists photos_gallery_idx on photos (gallery_id, sort_order);

create table if not exists photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos (id) on delete cascade,
  gallery_id uuid not null references galleries (id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('admin', 'client')),
  body text not null check (char_length(body) between 1 and 2000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists photo_comments_gallery_idx on photo_comments (gallery_id, created_at);

create table if not exists photo_selections (
  photo_id uuid primary key references photos (id) on delete cascade,
  gallery_id uuid not null references galleries (id) on delete cascade,
  selected boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Public store: url is served directly by next/image.
create table if not exists portfolio_images (
  id uuid primary key default gen_random_uuid(),
  url text not null unique,
  alt text not null default '',
  category text not null default 'corporate',
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Stripe webhook idempotency: one row per processed event id
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Lightroom Classic integration
-- ---------------------------------------------------------------------------

-- Personal API tokens for the Lightroom publish plugin (hash only is stored).
create table if not exists api_tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token_hash text not null unique,
  token_prefix text not null,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Lightroom's photo UUID so republishing an edited photo replaces the same row
-- (comments and favorites survive).
alter table photos add column if not exists lr_photo_id text;

create unique index if not exists photos_gallery_lr_photo_idx on photos (gallery_id, lr_photo_id) where lr_photo_id is not null;

alter table galleries add column if not exists source text not null default 'web';

-- ---------------------------------------------------------------------------
-- CRM: every contact-form message belongs to a client record
-- ---------------------------------------------------------------------------

alter table clients add column if not exists archived boolean not null default false;

alter table inquiries add column if not exists client_id uuid references clients (id) on delete cascade;

create index if not exists inquiries_client_idx on inquiries (client_id, created_at);

-- Backfill: give older messages a client (matched by email) so nothing is orphaned.
insert into clients (name, email, phone, created_at)
select distinct on (lower(i.email)) i.name, i.email, i.phone, i.created_at
from inquiries i
where i.client_id is null
  and not exists (select 1 from clients c where lower(c.email) = lower(i.email))
order by lower(i.email), i.created_at asc;

update inquiries i
set client_id = c.id
from clients c
where i.client_id is null and lower(c.email) = lower(i.email);
