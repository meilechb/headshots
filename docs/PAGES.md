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
- “Recent sessions”: up to 6 featured portfolio photos, no filters. Clicking one opens the photo viewer (see Portfolio). Link “Full portfolio”.
- “How it works”: three steps, each with a title and one sentence (Book / Shoot / Choose & receive).
- Packages: the first three active packages, each with name, description, price, first four inclusions, button “Book {name}” (→ Contact with that package preselected). The package marked featured also shows the label “Most popular”.
- Closing call to action: headline, button “Get in touch” (→ Contact), the studio email address.

### Portfolio — `/portfolio`
Content:
- Heading “Portfolio”.
- All published portfolio photos in one gallery.
- Photo viewer: opens when a photo is clicked. Shows one photo at a time with a position counter (“3 / 24”). Controls: previous, next, close. Keyboard: left/right arrows move, Escape closes. Swiping works on touch screens.
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
- Submitting files the message under a client in the studio’s Clients list. A new sender becomes a new client; a known email address is matched to the existing client.

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

The studio is organised around **clients**. Everything about one person (their messages, their session and payment, their galleries) is on that person’s page. There are no separate inquiry or order screens.

### Appears on every studio page
- Site name, the word “Studio”, link “View site”.
- Navigation: Clients, Galleries, Portfolio, Packages, Lightroom.
- Signed-in email address, “Sign out”.
- Every form shows “Saving…” while it works, “Saved” when it succeeds, and the reason in place when it fails.

### Login — `/login`
- Site name, “Studio login”, one sentence.
- Fields: Email, Password. Button “Sign in”.
- Error message on a wrong password (email stays filled in). After signing in, opens the page that was requested.

### Clients — `/admin/clients` (also where `/admin` opens)
- Heading, one sentence, count of new messages.
- Button “Add client” reveals a form: Name (required), Email (required), Phone, Company. Button “Add client” (opens the new client).
- Stage tabs with counts: All, New lead, Awaiting payment, Booked, Proofs out, Delivered, Archived (Archived only appears when there is one). The stage is worked out automatically:
  - **New lead**: wrote in or was added, no session yet.
  - **Awaiting payment**: has a session that is not paid.
  - **Booked**: session paid.
  - **Proofs out**: a proofs gallery is live.
  - **Delivered**: a final gallery is live.
  - **Archived**: set by hand with the Archive button; hidden from the other tabs.
- Search box: filters by name, email or company.
- One row per client: name (a dot marks an unread message), company and email, stage, next step (for example “Reply and set up a session”, “Waiting for payment”, “Shoot Oct 3”, “2 notes to answer”), last activity date. Clicking the name opens the client.

### Client — `/admin/clients/[id]`
- Back link. Name, stage, email (opens mail), phone (opens dialer), company.
- Buttons: “Archive” / “Unarchive”; “Delete” (only shown when the client has no sessions or galleries; asks for confirmation).
- Opening the page marks the client’s messages as read.
- **Messages**: every contact-form message from this person, newest first, with date, the package they were interested in and a “New” marker. “Reply by email” opens a pre-written email. Each message can be deleted.
- **Sessions & payment**: one session is one shoot with one price. Each session shows title, package, shoot date, order number, price, and “Paid {date}” or “Awaiting payment”. While unpaid: the payment link with “Copy link”, “Email payment link” (opens a pre-written email), and “Mark paid (cash / Zelle)”. A manual payment can be undone with “Undo mark paid”; Stripe payments cannot. “Edit session” expands a form: Title, Price, Shoot date, Note to client (shown on the pay page), Private notes; “Save”; “Delete session” (confirmation; galleries stay).
  - “Set up a session” / “Add another session”: Package (choosing one fills in the title, price and note), Title, Price, Shoot date, Note to client. Button “Add session”. New sessions start as “Awaiting payment”.
- **Galleries**: list of this client’s galleries with type, photo count, favorites, open notes and status (link to the gallery). Buttons “New proofs gallery” and “New final gallery” create the gallery immediately (titled “{Name} — Proofs” or “{Name} — Final photos”, linked to the latest session) and open it.
- **Details** form: Name, Email, Phone, Company, Private notes; “Save”.

### Galleries — `/admin/galleries`
- Heading, one sentence.
- Button “New gallery” reveals a form: Client (dropdown), Type (Proofs / Final photos), Title (optional). Button “Create gallery” (opens the gallery).
- List: title (link) with the gallery’s web address, client (link), type, number of photos, what came back from the client (favorites, open notes), status (Draft / Live / Closed), date created.

### Gallery — `/admin/galleries/[id]`
- Back link. Title, status, client (link), type, number of photos, favorites, open notes.
- Button “Make live” (disabled until at least one photo exists; “Reopen” on a closed gallery) or “Close gallery”. Link “Preview” (opens the client view).
- **Send to client**: the gallery link with “Copy”; the access code with “Copy”; “Email link + code” (opens a pre-written email); “New code” (generates a new random code). A note explains what the client sees while the gallery is a draft or closed.
- **Settings** form: Title, Type, Welcome message, “Client can download the files” checkbox, “Closes automatically on” date; “Save settings”; “Delete gallery” (confirmation; deletes the photo files too).
- Upload area: drop or choose several image files at once. Each file shows its progress (queued / uploading / processing / done / error).
- “Client favorites (N)”: expandable list of the filenames the client favorited.
- Photos, in delivery order. Each shows: position number, filename, whether it is a favorite, how many unresolved notes it has, buttons to move it up or down, “Notes”. “Notes” expands the photo to show every note (author, date, text), a “Resolve” / “Reopen” button per client note, a reply field with “Send”, and “Delete photo” (confirmation).

### Portfolio — `/admin/portfolio`
- Upload area for several files at once (no categories).
- Every uploaded portfolio photo with: the image, labels “Hidden” (not published) and “Featured” when applicable, and a form: Description (alt text), Order, Featured checkbox, Published checkbox, “Save”, “Delete” (confirmation).
- Featured photos are the ones used on the home page and About page.

### Packages — `/admin/packages`
- One form per existing package: Name, Web name, Price, Description, Includes (one line per item), Turnaround, Order, “Most popular” checkbox, “Shown on site” checkbox, “Save”, “Delete” (confirmation).
- One empty “New package” form with the same fields and button “Add package”.
- Packages appear on the Home and Pricing pages and in the “Set up a session” form.

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
- Payment link email: subject “Payment for your headshot session — Meilech Biller”; body with amount and link.
- Proofs ready email: link, access code, what to do (mark favorites, leave notes).
- Finals ready email: link, access code.
- Stripe sends its own payment receipt.
