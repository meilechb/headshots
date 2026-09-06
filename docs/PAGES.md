# meilechbiller.com — page and feature inventory (for design)

Every screen in the product, what it does, and every interactive element on it. Three audiences share the site:

| Audience | Entry point | Auth |
| --- | --- | --- |
| **Visitors** (prospective clients) | meilechbiller.com | none |
| **Clients** (people who were photographed) | link + 6-character access code sent by email | access code → 30-day cookie |
| **Meilech** (studio admin) | /login | email + password |

Global: light theme only today (warm paper background, near-black ink, brass accent). Display serif for headlines, sans for UI. Mobile breakpoint ~768px; admin has a left sidebar on desktop that collapses to a top bar on mobile. All forms show inline validation messages; destructive actions ask for confirmation.

---

## 1. Public site (marketing)

Shared **header**: wordmark (“Meilech Biller” + small “Headshots” tag), nav (Portfolio, Pricing, About, Contact), primary button “Book a session”; hamburger menu on mobile with the same links.
Shared **footer**: wordmark + tagline, Studio links (Portfolio, Pricing, About, Book a session), Client links (Open your gallery, email address, Studio login), copyright + image-rights line.

### 1.1 Home — `/`
- Hero: eyebrow (“Headshot photography · New York”), H1, one paragraph, two buttons (Book a session → /contact, View portfolio → /portfolio), 3-item stats row (Turnaround / Sessions / Delivery), hero image (the first “featured” portfolio image; placeholder gradient if none).
- “Recent sessions”: eyebrow + H2, masonry grid of up to 6 featured portfolio images (click opens lightbox), “Full portfolio →” link.
- “How it works”: 3 numbered cards (Book / Shoot / Choose & receive).
- Packages preview: 3 package cards from the database (name, description, price, first 4 inclusions, “Book {name}” → /contact?package=slug); featured package gets a “Most popular” badge and accent ring.
- CTA band (dark): headline, “Get in touch” button, email button.

### 1.2 Portfolio — `/portfolio`
- Intro (eyebrow, H1, paragraph).
- Category filter chips: All, Corporate, Personal Brand, Actors, Teams, Creative (single-select).
- Masonry grid of all published portfolio images (aspect ratio preserved; hover zoom).
- **Lightbox**: full-screen dark overlay, image fit-to-screen, prev/next arrows, close (X), keyboard ← → Esc, click outside closes.
- Empty state: sample gradient tiles + one-line note (shown until images are uploaded).

### 1.3 Pricing — `/pricing`
- Intro.
- Package cards (all active packages; 4 by default): name, badge (“Most popular”), description, price (with “/ person” suffix for team), turnaround line, full inclusions list, “Book {name}” button.
- FAQ: 4 question/answer rows (payment, wardrobe, delivery, teams).

### 1.4 About — `/about`
- Two columns: portrait image (featured portfolio image or placeholder) and copy (eyebrow, H1, 3 paragraphs), two buttons (Book a session, See the work).

### 1.5 Contact / Book — `/contact` (accepts `?package=slug`)
- Left column: eyebrow, H1, paragraph, contact details (Email, Studio location, On location).
- **Inquiry form** (card): Name*, Email*, Phone, “Interested in” select (Not sure yet + packages; preselected from URL), “What are the photos for?” textarea, hidden honeypot, submit “Send inquiry”. States: sending (button disabled), inline error (keeps typed values), success card (“Thanks — I’ll be in touch.”).

### 1.6 Pay — `/pay/[orderId]` (link sent by Meilech; not linked from nav)
- Card: “Order #1234” eyebrow, order title, “For {client}”, optional description, details list (Session date, Status, Total), **Pay $X securely** button (→ Stripe Checkout, hosted by Stripe), note about card/Apple Pay/Google Pay, contact line.
- Alternate states: already paid (green “Paid on {date}” panel), not awaiting payment (grey note), unknown order → 404.

### 1.7 Payment success — `/pay/success`
- Card: “Payment received” eyebrow, “Thank you.”, amount + receipt email line, follow-up note, buttons (Back to site, email).

### 1.8 System pages
- 404 “Page not found” (branded, link home).
- OG/social share image (auto-generated 1200×630: name, tagline, URL).

---

## 2. Client gallery (private, code-protected)

Shared minimal header (wordmark left, “Client gallery” label right) and footer (“Questions about your photos? email”).

### 2.1 Gallery landing — `/g`
- Card: “Open your gallery” H1, one input (paste link or gallery name), Continue button, inline error for bad input.

### 2.2 Access gate — `/g/[slug]` (locked state)
- Card: “For {client name}” eyebrow, gallery title H1, instruction line, **Access code** input (monospace, uppercase, letter-spaced), “View photos” button, inline error (“That code didn’t match…”). Correct code sets a 30-day cookie.
- Other states: gallery is draft → 404; archived or expired → “Gallery closed” card with contact email.

### 2.3 Gallery — `/g/[slug]` (unlocked)
- Header block: eyebrow (“Proofs for review · {client}” or “Final delivery · {client}”), title H1, welcome message (or default instruction text), meta line (N photos · N favorites · Available until {date}).
- Toolbar (right): “♥ Favorites” toggle (filters grid; only shown once there are favorites), “Download all” (final galleries with downloads on; shows “Preparing 3/12…” progress; builds a zip in the browser), “Lock gallery” (ghost button; returns to code screen).
- Photo grid: 2/3/4 columns responsive, 4:5 tiles, hover zoom, bottom gradient strip with filename + badges (💬 count, ♥).
- Empty state: “Photos are on their way.” / “No favorites yet.”
- **Photo viewer (lightbox)**: dark full-screen; image left (fit), side panel right (bottom sheet on mobile) with: filename, close (X), counter “3 / 12”, prev/next arrows + keyboard, **Mark favorite / ♥ Favorite** toggle (accent when on), **Download** (final galleries), **Notes** list (client vs “Photographer” label, date), note composer (textarea + “Send note”), inline error.

---

## 3. Studio (admin) — `/admin/*`

Requires login. **Layout**: left sidebar (wordmark + “Studio”, “View site →”, nav: Dashboard, Inquiries, Clients, Orders, Galleries, Portfolio, Packages, Lightroom; signed-in email; Sign out) and main content area. On mobile the sidebar becomes a top block with wrapped nav chips.

### 3.0 Login — `/login`
- Wordmark, “Studio login” H1, helper line, Email, Password, “Sign in” button; inline error (keeps email); redirects to the page you were trying to reach.

### 3.1 Dashboard — `/admin`
- Header: eyebrow “Studio”, H1 “Dashboard”, buttons “New order”, “New gallery”.
- 3 stat tiles (clickable): New inquiries, Awaiting payment, Live galleries.
- “Recent client notes” list: who/where (links to gallery), note text, Resolve/Reopen button per note.
- “Recent orders” list: “#1234 · Client — Title” with status and amount, links to order.

### 3.2 Inquiries — `/admin/inquiries`
- H1 + helper. List of inquiry cards: name + status badge (new highlighted), email (mailto) · phone · “interested in {package}” · date, message text. Actions per card: status select (new/contacted/booked/closed) + Save, **Make client** (creates/links a client and opens it), Delete (confirm).
- Empty state.

### 3.3 Clients — `/admin/clients`
- Two columns: table (Name → detail, Email, Company, Added) and **Add a client** form (Name*, Email*, Phone, Company, Notes, “Add client”).

### 3.4 Client detail — `/admin/clients/[id]`
- Header: back link, name H1, email · phone · company; buttons “New order”, “New gallery” (prefilled with this client).
- Left: **Orders** list (#, title, status, amount → order), **Galleries** list (title, kind · status → gallery).
- Right: **Details** form (Name, Email, Phone, Company, Notes; Save; Delete with confirm — only allowed with no orders/galleries).

### 3.5 Orders — `/admin/orders` (accepts `?status=`)
- Header + “New order”. Status filter chips (All + 9 statuses: Draft, Awaiting payment, Paid, Session scheduled, Editing, Proofs sent, Final delivered, Completed, Cancelled).
- Table: #, Client, Order title → detail, Session date, Status badge, Amount.

### 3.6 New order — `/admin/orders/new` (accepts `?client=`)
- Form card: Client select*, Package select (optional, shows price), Title*, Amount (USD)*, Session date, Status (Draft/Awaiting payment/Paid/Scheduled), Description (client-facing), Internal notes, “Create order”.

### 3.7 Order detail — `/admin/orders/[id]`
- Header: back link, “#1234 · Title” H1, client link · email · package; status badge + one-click **advance** button (“Mark paid”, “Mark session scheduled”, … follows the pipeline).
- **Payment** card: amount; if unpaid: pay link (code block + Copy), “Email payment link” (opens prefilled email), warning if not in “Awaiting payment”; if paid: green “Paid {datetime} · {payment id}”.
- **Galleries** card: list of linked galleries + “New gallery” (prefilled).
- **Details** form: Title, Amount, Session date, Status select (all 9), Description, Internal notes, Save, Delete (confirm).

### 3.8 Galleries — `/admin/galleries`
- Header + “New gallery”. Table: Gallery title → detail with `/g/slug` under it, Client, Type (proof/final), Photos count, Status badge (published = green), Created.

### 3.9 New gallery — `/admin/galleries/new` (accepts `?client=&order=`)
- Form: Client select*, Order select (optional), Title*, Type select (Proofs — comments on / Final — downloads on), “Create gallery” (auto-generates link slug and 6-character access code).

### 3.10 Gallery detail — `/admin/galleries/[id]`
- Header: back link, title H1, client link · type · order link · N photos · N favorites · N open notes; status badge; **Publish** (disabled with 0 photos) or **Archive**; “Preview ↗”.
- **Share with client** card: link (code block + Copy), access code (large monospace + Copy), **Email link + code** (prefilled email), **New code** (regenerate), custom code input + Set, draft warning.
- **Settings** form: Title, Type, Status, Welcome message, Allow downloads checkbox, Expires date, Save settings, Delete gallery (confirm; removes files).
- **Photos**: drag-and-drop **uploader** (multi-file; per-file progress list: queued/uploading/done/error), collapsible “Client favorites (N)” filename list, **photo manager grid**: tiles with badges (♥ Favorite, 💬 open notes), index + filename, ↑/↓ reorder, “Notes” expands the tile to a wide card with: notes thread (client vs You, dates, Resolve/Reopen per client note), reply input + Send, Delete photo (confirm).

### 3.11 Portfolio — `/admin/portfolio` (accepts `?category=`)
- Header + helper. “Upload into {category}” select + Select, uploader (resizes to 2400px).
- Grid of image cards: image with “Hidden”/“Featured” badges; per-image form: Alt text, Category select, Sort order, Featured checkbox, Published checkbox, Save, Delete (confirm).

### 3.12 Packages — `/admin/packages`
- One editable card per package: Name, Slug, Price (USD), Description, Includes (one per line), Turnaround, Order, Featured, Shown on site, Save, Delete; plus a “New package” card with the same fields.

### 3.13 Lightroom — `/admin/integrations`
- Intro. **Install the plugin** steps (download link, Plug-in Manager, Publishing Manager).
- **API tokens**: create form (name + Create token) → one-time reveal card (token + Copy + Lightroom hint); list of tokens (name, prefix, created, last used) with Revoke (confirm).
- **How it works in Lightroom** explainer list.

---

## 4. Lightroom Classic plugin (native Lightroom UI, not web)

- Publishing Manager panel: Site URL, API token (masked), **Test connection** + status line; “Client favorites” section: tag-with-keyword checkbox + keyword field.
- Create/Edit Published Collection dialog: Client dropdown (from the site; “New client” option with Name + Email fields), Gallery type (Proofs/Finals), “Make the gallery visible to the client as soon as photos are published” checkbox, status text.
- Behaviors: Publish uploads originals (site makes previews) and creates the gallery on first publish (dialog shows link + access code); edited photos re-publish and replace files while keeping notes; Library → Comments panel shows client notes (✓ prefix = resolved) and “Client favorite” rating; favorites get a keyword; removing photos deletes them from the gallery; deleting the collection archives the gallery; “Open gallery in browser” context menu item.

---

## 5. Emails the system prepares (opened in your mail app today)

- Payment link email (subject “Payment for your headshot session — Order #1234”; body with amount + link).
- Proofs ready email (link + access code + instructions).
- Finals ready email (link + access code).
- Stripe sends its own receipt.

Future (not built yet): automated sending, client “new note” notifications, contact-form auto-reply.
