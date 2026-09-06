# Meilech Biller Headshot Photography — meilechbiller.com

Portfolio site plus a small studio back office: client proofing galleries with
access codes and per-photo notes, final delivery with downloads, order tracking,
and Stripe payments. Runs entirely on free tiers.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) hosted on **Vercel**
- **Neon** — serverless Postgres (free plan, no card)
- **Vercel Blob** — photo storage: a private store for client galleries, a public store for the portfolio
- **Stripe Checkout** — hosted payment page + webhook fulfillment
- Admin login is a single email + password (hashed with scrypt) and a signed session cookie,
  following the Next.js authentication guide. No third-party auth service.

## What’s in the box

| Area | Route | Notes |
| --- | --- | --- |
| Public site | `/`, `/portfolio`, `/pricing`, `/about`, `/contact` | Portfolio grid with lightbox and category filter, packages from the database, contact form → inquiries |
| Client gallery | `/g/[slug]` | Access-code gate (30-day signed cookie). Proof galleries: favorites + notes per photo. Final galleries: per-photo and zip-all downloads. Photos stream through `/api/photo/[id]` after an access check |
| Payments | `/pay/[orderId]` → Stripe → `/pay/success` | Amounts always come from the order row; webhook at `/api/stripe/webhook` marks the order paid (idempotent) |
| Studio (admin) | `/admin` | Dashboard, inquiries → clients, orders with payment links, galleries (upload, reorder, codes, publish, reply to notes), portfolio manager, packages, Lightroom tokens |
| Lightroom API | `/api/lr/*` | Bearer-token API used by the Lightroom Classic publish plugin in `lightroom/` |
| Auth | `/login`, `/auth/signout` | Single admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` |

Schema: `db/schema.sql`. Starter packages: `db/seed.sql`.

## Setup (about 20 minutes)

```bash
npm install
cp .env.example .env.local
```

### 1. Neon (database)

1. Create a free account at <https://neon.com> and a project (any region near you).
2. Click **Connect**, copy the connection string into `DATABASE_URL` in `.env.local`.
3. Create the tables and starter packages:
   ```bash
   npm run db:seed        # runs db/schema.sql then db/seed.sql
   ```
   (Or paste both files into Neon’s **SQL Editor**.)

### 2. Vercel (hosting + photo storage)

1. Import the GitHub repo at <https://vercel.com/new> and deploy once (it works with no env vars; the public pages just show placeholders).
2. In the project, open **Storage → Create Database → Blob** twice:
   - name `galleries`, access **Private** → it adds `BLOB_READ_WRITE_TOKEN` to the project
   - name `portfolio`, access **Public** → in *Advanced Options* set the env var prefix to `PORTFOLIO` so it adds `PORTFOLIO_BLOB_READ_WRITE_TOKEN`
3. **Settings → Environment Variables**: add `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, the admin and session values from step 3, and the Stripe keys from step 4.
4. **Settings → Domains**: add `meilechbiller.com` and `www.meilechbiller.com` and create the DNS records Vercel shows you.
5. Redeploy.

To run locally with the same stores: `vercel env pull` writes the tokens into `.env.local`.

### 3. Admin login

```bash
npm run hash-password -- "a long strong password"   # prints ADMIN_PASSWORD_HASH=...
openssl rand -base64 32                             # SESSION_SECRET
```
Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` locally and in Vercel. Sign in at `/login`.

### 4. Stripe

1. **Developers → API keys**: `STRIPE_SECRET_KEY` (test keys until launch).
2. **Developers → Webhooks → Add endpoint**: `https://meilechbiller.com/api/stripe/webhook` with events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.
   Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
3. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, test card `4242 4242 4242 4242`.

## Lightroom Classic plugin

`lightroom/meilechbiller.lrplugin` is a Lightroom Classic **publish service**. One published collection = one client gallery.

1. In the studio dashboard open **Lightroom** (`/admin/integrations`), create an API token, and download the plugin zip (or use the folder in this repo).
2. Lightroom Classic → **File → Plug-in Manager → Add** → choose `meilechbiller.lrplugin`.
3. **File → Publishing Manager → Add** → Meilech Biller Galleries → enter the site URL and token → **Test connection** → Save.
4. Right-click the service → **Create Published Collection** → pick the client (or type a new one) and Proofs/Finals → drag photos in → **Publish**.

What happens: the plugin asks the site for a presigned upload URL per photo, PUTs the full-size JPEG straight to the private Blob store, then the site builds the 1600px preview and records the photo (`/api/lr/*`, bearer-token auth, hashes only in `api_tokens`). Re-publishing an edited photo replaces the files and keeps client notes. Client notes and favorites appear in Lightroom's Comments panel; favorites are tagged with the keyword “Client Favorite”. Removing a photo from the collection deletes it; deleting the collection archives the gallery.

After editing plugin files run `node scripts/plugin-zip.mjs` to refresh `public/downloads/meilechbiller-lightroom.zip`.

## Day-to-day workflow

1. **Inquiry** arrives from the contact form → `/admin/inquiries` → *Make client*.
2. **Order** → `/admin/orders/new` (client, package, amount, date). Copy the payment link from the order page and email it. Stripe → webhook → order shows **Paid**.
3. After the shoot: **New gallery** (type *Proofs*) → drag in the first edits → **Publish** → *Email link + code*. Clients mark favorites and leave notes per photo; you reply inline and resolve them.
4. Retouch the picks → **New gallery** (type *Final*, downloads on) → upload → publish → send.
5. Move the order to **Final delivered** / **Completed**.

Portfolio images for the public site are managed at `/admin/portfolio` (featured images feed the home page hero and “Recent sessions”).

## How photos are stored

- Gallery uploads go from the browser straight to the private Blob store as two files: the original (for downloads) and a 1600px preview (for browsing). Nothing large passes through the server.
- Gallery photos are served by `/api/photo/[id]`, which checks the gallery cookie (or the admin session) right before streaming the blob, and lets the browser cache with `ETag` revalidation.
- Portfolio uploads are resized to 2400px and stored in the public store; `next/image` handles thumbnails.

## Free-tier limits to know

- Vercel Hobby: roughly 5 GB of Blob storage and 100 GB/month transfer; Vercel emails you as you approach them and pauses Blob (not the site) if exceeded until the month rolls over.
- Neon Free: 0.5 GB per project, far more than this app’s metadata needs.
- Stripe: no monthly fee; per-transaction pricing only.

## Notes and follow-ups

- No transactional email provider is wired in; sharing uses prefilled `mailto:` links. Resend or Postmark would automate “your proofs are ready” emails.
- Row types in `src/lib/types.ts` are hand-written to match `db/schema.sql`.
- Next.js expands `$VAR` inside `.env*` files, so secrets containing `$` must be escaped as `\$` locally. The generated password hash uses `:` separators to avoid this.

## Scripts

```bash
npm run dev            # start locally
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
npm run build          # production build
npm run db:migrate     # apply db/schema.sql to DATABASE_URL
npm run db:seed        # schema + starter packages
npm run hash-password -- "password"
```
