# Meilech Biller Headshot Photography — meilechbiller.com

Portfolio site plus a small studio back office: client proofing galleries with
access codes and per-photo notes, final delivery with downloads, order tracking,
and Stripe payments.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) on **Vercel**
- **Supabase** — Postgres, Auth (admin login), Storage (portfolio + galleries)
- **Stripe Checkout** — hosted payment page + webhook fulfillment

## What’s in the box

| Area | Route | Notes |
| --- | --- | --- |
| Public site | `/`, `/portfolio`, `/pricing`, `/about`, `/contact` | Portfolio grid with lightbox and category filter, packages from the database, contact form → inquiries |
| Client gallery | `/g/[slug]` | Access-code gate (30-day signed cookie). Proof galleries: favorites + notes per photo. Final galleries: per-photo and zip-all downloads via short-lived signed URLs |
| Payments | `/pay/[orderId]` → Stripe → `/pay/success` | Amounts always come from the order row; webhook at `/api/stripe/webhook` marks the order paid (idempotent) |
| Studio (admin) | `/admin` | Dashboard, inquiries → clients, orders with payment links, galleries (upload, reorder, codes, publish, reply to notes), portfolio manager, packages |
| Auth | `/login`, `/auth/signout`, `/auth/confirm` | Supabase Auth. The **first user to sign up becomes admin** (trigger in the migration) |

Database schema and RLS policies: `supabase/migrations/0001_init.sql`.
Starter packages: `supabase/seed.sql`.

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### 1. Supabase

1. Create a project at <https://supabase.com/dashboard> (region close to you).
2. **SQL Editor** → paste and run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
   With the CLI instead: `supabase link --project-ref <ref> && supabase db push`.
3. **Project Settings → API**: copy the project URL and the **publishable** key into
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the
   **secret** key into `SUPABASE_SECRET_KEY` (server only).
4. **Authentication → Users → Add user**: create your own login with email + password
   (Auto Confirm on). Because it is the first user, the trigger makes it `admin`.
   Later sign-ups are plain `client` profiles with no admin access.
5. Optional: **Authentication → URL Configuration** — set Site URL to
   `https://meilechbiller.com` and add `https://meilechbiller.com/auth/confirm` to
   redirect URLs if you use email links.

Storage buckets `portfolio` (public) and `galleries` (private) are created by the
migration together with their policies.

### 2. Stripe

1. **Developers → API keys**: `STRIPE_SECRET_KEY` (use test keys until launch).
2. **Developers → Webhooks → Add endpoint**: `https://meilechbiller.com/api/stripe/webhook`
   with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
3. Local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   and put the printed `whsec_…` in `.env.local`. Test card `4242 4242 4242 4242`.

### 3. Gallery cookie secret

```bash
openssl rand -base64 32   # → GALLERY_COOKIE_SECRET
```

## Deploy to Vercel

1. Import the GitHub repo in Vercel (framework preset: Next.js, no build changes needed).
2. Add every variable from `.env.example` under **Settings → Environment Variables**
   (set `NEXT_PUBLIC_SITE_URL=https://meilechbiller.com`).
3. **Settings → Domains** → add `meilechbiller.com` and `www.meilechbiller.com`, then
   create the DNS records Vercel shows you at your registrar. Vercel issues TLS
   automatically. Docs: <https://vercel.com/docs/domains/working-with-domains/add-a-domain>
4. Update the Stripe webhook URL and Supabase Site URL to the production domain.

## Day-to-day workflow

1. **Inquiry** arrives from the contact form → `/admin/inquiries` → *Make client*.
2. **Order** → `/admin/orders/new` (client, package, amount, date). Copy the payment
   link from the order page and email it. Stripe → webhook → order shows **Paid**.
3. After the shoot: **New gallery** (type *Proofs*) → drag in the first edits → **Publish**
   → *Email link + code*. The client marks favorites and leaves notes per photo; both
   appear on the gallery page and the dashboard. Reply inline and mark notes resolved.
4. Retouch the picks → **New gallery** (type *Final*, downloads on) → upload → publish → send.
5. Move the order to **Final delivered** / **Completed**.

Portfolio images for the public site are managed at `/admin/portfolio`
(featured images feed the home page hero and “Recent sessions”).

## Notes and follow-ups

- No transactional email provider is wired in; sharing uses prefilled `mailto:` links.
  Adding Resend/Postmark for automatic “your proofs are ready” emails is the natural next step.
- “Download all” zips files in the browser from signed URLs. If the browser blocks the
  cross-origin fetch, clients still have per-photo download buttons.
- Row types in `src/lib/types.ts` are hand-written; once a project is linked you can
  generate them with `supabase gen types typescript --linked > src/lib/database.types.ts`.
- Image transforms (thumbnails) are done by `next/image`, so no Supabase Pro plan is required.

## Scripts

```bash
npm run dev     # start locally
npm run lint    # eslint
npx tsc --noEmit
npm run build   # production build (also type-checks)
```
