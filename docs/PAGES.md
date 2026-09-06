# meilechbiller.com — what is on every page

Facts only: the content and functions that exist on each page. Nothing here describes appearance, layout, or styling.

## Who uses the site

| User | How they get in |
| --- | --- |
| Visitors (prospective clients) | Open meilechbiller.com. No login. |
| Clients (people who were photographed) | Open a gallery link from an email and type a 6-character access code. Stays unlocked for 30 days on that device. No account. |
| Meilech (studio owner) | Logs in with email and password at /login. |
| Lightroom Classic plugin | Talks to the site in the background. Its screens are inside Lightroom, not on the website. |

---

## 1. Public pages (visitors)

### Appears on every public page
- Site name: “Meilech Biller”.
- Navigation links: Portfolio, Pricing, About, Contact.
- Button: “Book a session” (goes to Contact).
- Footer content: site name, one-line description, links (Portfolio, Pricing, About, Book a session, Open your gallery, Studio login), studio email address, copyright line, image-rights line.

### Home — `/`
Content:
- Short label (“Headshot photography · New York”), main headline, one paragraph.
- Buttons: “Book a session” (→ Contact), “View portfolio” (→ Portfolio).
- Three facts: Turnaround (2–3 days), Sessions (Studio or on-site), Delivery (Private gallery).
- One main photo (the first photo marked “featured” in the portfolio; blank placeholder until photos exist).
- “Recent sessions”: up to 6 featured portfolio photos. Clicking one opens the photo viewer (see Portfolio). Link “Full portfolio”.
- “How it works”: three steps, each with a title and one sentence (Book / Shoot / Choose & receive).
- Packages: the first three active packages, each with name, description, price, first four inclusions, button “Book {name}” (→ Contact with that package preselected). The package marked featured also shows the label “Most popular”.
- Closing call to action: headline, button “Get in touch” (→ Contact), the studio email address.

### Portfolio — `/portfolio`
Content:
- Label, headline, one paragraph.
- Category filter with options: All, Corporate, Personal Brand, Actors, Teams, Creative. One category active at a time.
- All published portfolio photos. Each photo has alt text and a category.
- Photo viewer: opens when a photo is clicked. Shows one photo at a time. Controls: previous, next, close. Keyboard: left/right arrows move, Escape closes.
- When no photos have been uploaded yet: sample placeholders and a one-sentence note.

### Pricing — `/pricing`
Content:
- Label, headline, one paragraph.
- Every active package (four by default: Essential, Professional, Executive, Team & Office). Each has: name, optional “Most popular” label, description, price (team package is per person), turnaround time, full list of inclusions, button “Book {name}” (→ Contact with the package preselected).
- FAQ: four questions with answers (how to pay, what to wear, how photos are delivered, team sessions).

### About — `/about`
Content:
- One portrait photo (a featured portfolio photo; placeholder until one exists).
- Label, headline, three paragraphs.
- Buttons: “Book a session” (→ Contact), “See the work” (→ Portfolio).

### Contact / Book — `/contact` (can be opened as `/contact?package=slug`)
Content:
- Label, headline, one paragraph.
- Contact facts: Email, Studio location, On-location note.
- Inquiry form fields: Name (required), Email (required), Phone (optional), “Interested in” dropdown (Not sure yet, plus every active package; preselected when the URL names a package), “What are the photos for?” (long text). Button “Send inquiry”.
- Behavior: while sending, the button is disabled. If something is wrong, an error message appears and the typed values stay in the fields. On success the form is replaced by a confirmation: “Thanks — I’ll be in touch.” plus one sentence about response time.
- Submitting creates an inquiry in the studio’s Inquiries list.

### Pay — `/pay/[orderId]`
Reached only through a link the studio sends. Content:
- “Order #{number}”, order title, “For {client name}”, optional description.
- Facts: Session date (if set), Status, Total.
- Button “Pay ${amount} securely”. Clicking it sends the client to Stripe’s hosted checkout page. A note lists accepted methods (card, Apple Pay, Google Pay) and that they return here after paying.
- Studio email address.
- Other states: already paid → shows “Paid on {date}” instead of the button; order not awaiting payment → shows a note instead of the button; unknown order → “Page not found”.

### Payment success — `/pay/success`
Content: “Payment received”, “Thank you.”, the amount paid and the email the receipt was sent to, one sentence about next steps, buttons “Back to site” and the studio email.

### Other
- “Page not found” page with a link home.
- Automatic social-share image (site name, tagline, address) used when a link to the site is shared.

---

## 2. Client gallery pages (clients)

### Appears on every gallery page
- Site name, the words “Client gallery”.
- Footer line: “Questions about your photos?” with the studio email.

### Find your gallery — `/g`
- Headline “Open your gallery”.
- One text field: paste the gallery link or type the gallery name. Button “Continue”.
- Error message if the input is not a gallery link.

### Locked gallery — `/g/[gallery-name]`
- “For {client name}”, gallery title, instruction to enter the code from the email.
- One field: Access code. Button “View photos”.
- Error message when the code is wrong.
- Entering the right code unlocks the gallery for 30 days on that device.
- Other states: gallery not yet published → “Page not found”; gallery archived or past its expiry date → “Gallery closed” with the studio email.

### Unlocked gallery — `/g/[gallery-name]`
Content:
- One of two labels: “Proofs for review · {client}” or “Final delivery · {client}”.
- Gallery title.
- Welcome message written by the studio, or default instruction text (proofs: mark favorites and leave notes; finals: download individually or all at once).
- Counts: number of photos, number of favorites, “Available until {date}” if an expiry is set.
- Controls: “Favorites” filter (only once at least one favorite exists; shows only favorited photos); “Download all” (only in final galleries with downloads enabled; shows progress “Preparing 3/12…” and produces one zip file); “Lock gallery” (returns to the code screen).
- All photos in the gallery, in the order the studio set. Each shows its filename, the number of notes on it, and whether it is a favorite.
- Empty states: “Photos are on their way.” / “No favorites yet.”

Photo viewer (opens when a photo is clicked):
- The photo, its filename, position counter (“3 / 12”), previous/next, close. Keyboard arrows and Escape work.
- “Mark favorite” / “Favorite” toggle.
- “Download” (only in final galleries with downloads enabled).
- Notes: list of all notes on this photo, each with author (client’s name, or “Photographer”) and date. Text field to write a note and button “Send note”. Error message if saving fails.

---

## 3. Studio pages (Meilech, login required) — `/admin/...`

### Appears on every studio page
- Site name, the word “Studio”, link “View site”.
- Navigation: Dashboard, Inquiries, Clients, Orders, Galleries, Portfolio, Packages, Lightroom.
- Signed-in email address, “Sign out”.

### Login — `/login`
- Site name, “Studio login”, one sentence.
- Fields: Email, Password. Button “Sign in”.
- Error message on a wrong password (email stays filled in). After signing in, opens the page that was requested.

### Dashboard — `/admin`
- Buttons: “New order”, “New gallery”.
- Three counts, each a link: New inquiries, Awaiting payment, Live galleries.
- “Recent client notes”: the last 8 notes left by clients. Each shows who wrote it, which gallery and photo (link to the gallery), the text, and a “Resolve” / “Reopen” button.
- “Recent orders”: the last 6 orders, each with number, client, title, status, amount; each links to the order.

### Inquiries — `/admin/inquiries`
- One entry per inquiry from the contact form: name, status (new / contacted / booked / closed), email (opens mail), phone, the package they chose, date received, their message.
- Per inquiry: status dropdown + “Save”; “Make client” (creates a client from the inquiry, or links to the existing client with that email, marks the inquiry contacted, and opens the client); “Delete” (asks for confirmation).
- Empty state text when there are none.

### Clients — `/admin/clients`
- List of all clients: Name (link to the client), Email, Company, date added.
- “Add a client” form: Name (required), Email (required), Phone, Company, Notes. Button “Add client” (opens the new client).

### Client — `/admin/clients/[id]`
- Back link to Clients. Client name, email, phone, company.
- Buttons: “New order”, “New gallery” (both pre-select this client).
- Orders belonging to this client: number, title, status, amount (links).
- Galleries belonging to this client: title, type, status (links).
- Edit form: Name, Email, Phone, Company, Notes; “Save”; “Delete” (confirmation; only works when the client has no orders or galleries).

### Orders — `/admin/orders`
- Button “New order”.
- Filter by status: All, Draft, Awaiting payment, Paid, Session scheduled, Editing, Proofs sent, Final delivered, Completed, Cancelled.
- List: order number, client, title (link), session date, status, amount.

### New order — `/admin/orders/new`
- Fields: Client (required, dropdown of all clients), Package (optional, shows price), Title (required), Amount in USD (required), Session date, Status (Draft / Awaiting payment / Paid / Session scheduled), Description (the client sees this on the pay page), Internal notes. Button “Create order” (opens the order).

### Order — `/admin/orders/[id]`
- Back link. “#{number} · {title}”, client name (link), client email, package name.
- Current status, and one button that moves it to the next status (Draft → Awaiting payment → Paid → Session scheduled → Editing → Proofs sent → Final delivered → Completed).
- Payment section: the amount. If unpaid: the payment link, “Copy” button, “Email payment link” (opens a pre-written email), and a note if the order is not currently awaiting payment. If paid: paid date/time and the Stripe payment id.
- Galleries linked to this order (links) and button “New gallery” (pre-selects this client and order).
- Edit form: Title, Amount, Session date, Status (all statuses), Description, Internal notes; “Save”; “Delete” (confirmation; linked galleries are kept).

### Galleries — `/admin/galleries`
- Button “New gallery”.
- List: title (link) with the gallery’s web address, client, type (proof / final), number of photos, status (draft / published / archived), date created.

### New gallery — `/admin/galleries/new`
- Fields: Client (required), Order (optional), Title (required), Type (Proofs: clients mark favorites and leave notes / Final: downloads enabled). Button “Create gallery”.
- Creating a gallery generates its web address and a 6-character access code automatically.

### Gallery — `/admin/galleries/[id]`
- Back link. Title, client (link), type, linked order (link), number of photos, number of favorites, number of unresolved client notes.
- Status. Button “Publish” (disabled until at least one photo exists) or “Archive”. Link “Preview” (opens the client view).
- Share section: the gallery link with “Copy”; the access code with “Copy”; “Email link + code” (opens a pre-written email to the client); “New code” (generates a new random code); a field to type a custom code with “Set”. A note when the gallery is still a draft.
- Settings form: Title, Type, Status (Draft / Published / Archived), Welcome message, “Allow downloads” checkbox, Expiry date; “Save settings”; “Delete gallery” (confirmation; deletes the photo files too).
- Upload area: drop or choose several image files at once. Each file shows its progress (queued / uploading / done / error).
- “Client favorites (N)”: expandable list of the filenames the client favorited.
- Photos, in delivery order. Each shows: position number, filename, whether it is a favorite, how many unresolved notes it has, buttons to move it up or down, “Notes”. “Notes” expands the photo to show every note (author, date, text), a “Resolve” / “Reopen” button per client note, a reply field with “Send”, and “Delete photo” (confirmation).

### Portfolio — `/admin/portfolio`
- “Upload into {category}” dropdown (Corporate, Personal Brand, Actors, Teams, Creative) and an upload area for several files at once.
- Every uploaded portfolio photo with: the image, labels “Hidden” (not published) and “Featured” when applicable, and a form: Alt text, Category, Sort order, Featured checkbox, Published checkbox, “Save”, “Delete” (confirmation).
- Featured photos are the ones used on the home page and About page.

### Packages — `/admin/packages`
- One form per existing package: Name, Slug (web name), Price in USD, Description, Includes (one line per item), Turnaround, Order (sort position), Featured checkbox, “Shown on site” checkbox, “Save”, “Delete” (confirmation).
- One empty “New package” form with the same fields and button “Add package”.
- Packages appear on the Home and Pricing pages.

### Lightroom — `/admin/integrations`
- Explanation of the Lightroom connection.
- Install steps: a link to download the plugin; the Lightroom menus to use.
- API tokens: form with a token name and button “Create token”. After creating, the token is shown once with a “Copy” button. List of existing tokens: name, first characters, date created, last used; “Revoke” (confirmation).
- A list of how the plugin behaves (publish, re-publish, notes, favorites, removal).

---

## 4. Lightroom Classic plugin (screens inside Lightroom, not on the website)

- Publishing Manager settings: Site URL, API token, “Test connection” button with a result line; “Client favorites” option: checkbox to tag favorites with a keyword and the keyword text (default “Client Favorite”).
- Published collection settings: Client dropdown (all clients on the site, or “New client” with Name and Email fields), Gallery type (Proofs / Finals), checkbox “Make the gallery visible to the client as soon as photos are published”.
- Behavior: publishing uploads the photos and, on first publish, creates the gallery and shows its link and access code; re-publishing an edited photo replaces it and keeps the client’s notes; client notes and favorites appear in Lightroom’s Comments panel and favorites get the keyword; removing a photo from the collection deletes it from the gallery; deleting the collection archives the gallery; “Open gallery in browser” opens the client view.

---

## 5. Emails the site prepares

Each opens pre-written in the studio’s own email app (nothing is sent automatically yet):
- Payment link email: subject “Payment for your headshot session — Order #{number}”; body with amount and link.
- Proofs ready email: link, access code, what to do (mark favorites, leave notes).
- Finals ready email: link, access code.
- Stripe sends its own payment receipt.
