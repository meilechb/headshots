-- Meilech Biller Headshot Photography — initial schema
-- Apply with: supabase db push   (or paste into the SQL editor)

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles: one row per auth user. The first user to sign up becomes admin.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'client')),
  created_at timestamptz not null default now()
);

-- security definer so policies can call it without recursing into profiles RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when first_user then 'admin' else 'client' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Business tables
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.packages (
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

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  package_slug text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed')),
  created_at timestamptz not null default now()
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer not null default nextval('public.order_number_seq') unique,
  client_id uuid not null references public.clients (id) on delete restrict,
  package_id uuid references public.packages (id) on delete set null,
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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  client_id uuid not null references public.clients (id) on delete restrict,
  slug text not null unique,
  title text not null,
  kind text not null check (kind in ('proof', 'final')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  -- Plain access code, visible only to the admin (RLS) so it can be re-sent.
  access_code text,
  allow_downloads boolean not null default false,
  welcome_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  storage_path text not null unique,
  filename text not null,
  width integer,
  height integer,
  size_bytes bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index photos_gallery_idx on public.photos (gallery_id, sort_order);

create table public.photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  author_name text not null,
  author_role text not null check (author_role in ('admin', 'client')),
  body text not null check (char_length(body) between 1 and 2000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index photo_comments_gallery_idx on public.photo_comments (gallery_id, created_at);

create table public.photo_selections (
  photo_id uuid primary key references public.photos (id) on delete cascade,
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  selected boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
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
create table public.stripe_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Grants (Supabase roles)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.packages, public.portfolio_images to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Admin (profiles.role = 'admin') manages everything through the browser
-- session. Visitors without accounts (contact form, code-protected galleries,
-- Stripe webhook) are served by server code using the secret key, which
-- bypasses RLS after application-level checks.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.packages enable row level security;
alter table public.inquiries enable row level security;
alter table public.orders enable row level security;
alter table public.galleries enable row level security;
alter table public.photos enable row level security;
alter table public.photo_comments enable row level security;
alter table public.photo_selections enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.stripe_events enable row level security;

create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Admins manage profiles" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Active packages are public" on public.packages
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "Admins manage packages" on public.packages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Published portfolio is public" on public.portfolio_images
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "Admins manage portfolio" on public.portfolio_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins manage clients" on public.clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage inquiries" on public.inquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage galleries" on public.galleries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage photos" on public.photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage comments" on public.photo_comments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage selections" on public.photo_selections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read stripe events" on public.stripe_events
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
--   portfolio : public bucket, served directly on the marketing site
--   galleries : private bucket, served to clients via short-lived signed URLs
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio', 'portfolio', true, 52428800, array['image/jpeg', 'image/png', 'image/webp']),
  ('galleries', 'galleries', false, 104857600, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Portfolio images are publicly readable" on storage.objects
  for select using (bucket_id = 'portfolio');

create policy "Admins manage portfolio objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());

create policy "Admins manage gallery objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'galleries' and public.is_admin())
  with check (bucket_id = 'galleries' and public.is_admin());
