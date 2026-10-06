# Market research: can this platform be offered to other photographers?

Research date: September 8, 2026. Every price and feature below was read from the vendor's own pricing or help page on that date unless marked **unverified**. Prices are USD per month unless stated. Where a vendor's page hides the monthly price behind a script, the annual-billing price is given and the monthly price is marked unverified.

## 1. Short answers

| Question | Answer |
| --- | --- |
| Is there another option for photographers? | Yes, many. At least 13 client-gallery products and 10 studio-management products serve this exact customer. The market is mature and crowded. |
| Can I offer this to photographers, and is it worth it to them? | Not in its current form. The code is a single-studio website, not a multi-customer product (section 6). The underlying idea has verified demand (section 5), and photographers pay $8 to $60 a month for tools like it, but making it sellable is a rebuild of the account, hosting and support layers, not a polish pass. |
| How much do comparable companies charge? | Gallery tools: $7 to $10 entry, $16 to $25 mid, $40 to $60 unlimited. CRM tools: $16 to $60. Bundles that combine both: $17 (CloudSpot Lite), $19 to $69 (Sprout Studio), $28 to $55 (Pixieset Suite). Free tiers are common and usually take a 15% cut of print sales. |
| Are we unique? | The individual pieces are not. The combination is: nobody found offers galleries, CRM with deposit and balance, an e-signed agreement, paid-lock on final downloads, and a two-way Lightroom plugin in one tool with no sales commission. |
| Is the Lightroom plugin unique to us? | No. Every major gallery platform ships a Lightroom Classic publish plugin. What is rare is what ours sends back: client comments into Lightroom's Comments panel with replies from inside Lightroom, and favorites as a keyword. Only Evlaa claims comment sync, and it has no CRM. |
| Do other photographer software companies use Lightroom plugins? | Yes. Pixieset, Pic-Time, ShootProof, CloudSpot, Pass, SmugMug, Zenfolio, Format, PhotoShelter, Picflow, Sprout Studio and Evlaa all ship one. Most are one-way upload only. |
| Is this a good product to go public with? | As a product to sell today: no. As the seed of one: the differentiators are real and small competitors survive on them (Evlaa claims 3,000 photographers at $9 to $55 a month). Section 8 lists what would have to be true first. |

## 2. What the platform is today

Feature inventory from the code (`README.md`, `docs/PAGES.md`, `db/schema.sql`, `lightroom/`):

- Public portfolio site with pricing, contact form, Google-only local landing pages and GA4 conversion events.
- Light CRM: contact-form messages become clients, stages (New lead, Awaiting payment, Booked, Proofs out, Delivered) are derived from data, sessions carry a package, price, deposit and shoot date.
- Payments: Stripe Payment Element embedded on the site, deposit or full payment, balance later, manual "mark paid", idempotent webhook plus success-page recording, extra retouched picks added to the balance.
- Generated photography services agreement, e-signed with name, IP and version before payment.
- Proof galleries: 6-character access code, 30-day cookie, favorites, per-photo notes, photographer replies and resolves notes.
- Final galleries: per-photo and zip download, downloads locked until the balance is paid, optional expiry.
- Email through Resend with editable templates and a send log.
- Lightroom Classic publish service (about 800 lines of Lua): one published collection is one gallery, presigned direct-to-storage upload of full-size JPEGs, re-publish replaces the file and keeps notes, client notes appear in the Comments panel, the photographer replies from Lightroom, favorites are tagged with a keyword, deleting a photo removes it, deleting the collection archives the gallery.

What it does not have: multi-user or multi-studio accounts, print or product sales, a mobile app, slideshows, video, RAW handling, watermarks on browser uploads (Lightroom's export watermark still applies to plugin uploads), per-person galleries for team headshot days, an office-manager view to collect a team's picks, automated tests, rate limiting.

## 3. Client-gallery competitors

### 3a. Pricing (paid tiers, monthly, annual billing where the vendor shows both)

| Product | Free tier | Entry | Mid | Top | Commission on sales | Source |
| --- | --- | --- | --- | --- | --- | --- |
| Pixieset | 3 GB, 15% commission | $8 (10 GB) | $16 (100 GB) / $24 (1 TB) | $40 unlimited | 0% on paid plans | https://pixieset.com/pricing/ |
| Pic-Time | 10 GB, drops to 3 GB after 6 months | $7 (20 GB) | $21 (100 GB) | $42 unlimited | 6% to 15% of markup depending on plan | https://www.pic-time.com/pricing |
| ShootProof | 100 photos (3 GB from Sept 23, 2026) | $10.99 | $19.99 / $26.67 | $50 unlimited | 0% always | https://www.shootproof.com/pricing |
| CloudSpot | 5 GB, 3 galleries, 15% | $7 (15 GB) | $17 (100 GB, includes CRM) / $34 | $50 unlimited | 0% from Lite | https://www.cloudspot.io/pricing |
| Pass | 10 GB, drops to 2 GB after 6 months | $6 (20 GB) | $20 (100 GB) | $38 unlimited, $125 concierge | 15% low tiers, 0% to 3% higher | https://www.passgallery.com/pricing |
| SmugMug | None, 14-day trial | $20 | $23.50 | $37 | 15% of markup | https://www.smugmug.com/plans |
| Zenfolio | None | $7 (15 GB) | $11.50 (150 GB) | $20 unlimited JPEG | 7% per order | https://zenfolio.com/pricing/ |
| PhotoShelter | None | $10 (4 GB) | $25 (100 GB) | $45 (500 GB) | 8% to 10% | https://www.photoshelter.com/signup/subscriber |
| Format | None, 14-day trial | $10 (70 images) | $12 (1,500 images) | $15 unlimited | 0% | https://www.format.com/pricing |
| Evlaa | 2 galleries, unlimited photos | $9 (10 galleries) | $16 / $22 | $44 (1,000 galleries) | 0% | https://www.evlaa.com/pages/pricing |
| Picflow | 2 GB | unverified (script-rendered) | | | no store | https://picflow.com/pricing |
| picdrop | 1 GB, 3 galleries | €14.99 (500 GB) | €39.99 (1 TB) | €99.99 (3 TB) | no store | https://www.picdrop.com/web/pricing |
| Headshot Tools | None | $59 flat, unlimited | | | none stated | https://www.headshottools.com/ |

Notes: ShootProof moves to GB-based plans on Sept 23, 2026 at the same prices (https://help.shootproof.com/hc/en-us/articles/42846503437591). HoneyBook added native galleries in July 2026 with 200 GB on its $29 Starter plan (https://help.honeybook.com/en/articles/15714707-create-and-share-photo-galleries-in-honeybook).

### 3b. Features that matter for this product

| Feature | Who has it | Who does not |
| --- | --- | --- |
| Per-photo client comments in the gallery | Pixieset (notes on favorites), Zenfolio (invited clients), Picflow, picdrop | Pic-Time, ShootProof (cart items only), CloudSpot, Pass, SmugMug, Format (unverified for the last three) |
| Client selection limit ("pick N") | Pixieset, Pic-Time, ShootProof, Pass, SmugMug (Pro), Picflow | CloudSpot (unverified) |
| "N included, extras cost $X" added to the balance | Pic-Time via its Simple Sales System | Not native elsewhere; others sell extras through a print store cart |
| Downloads locked until an invoice balance is paid | None of the 13 document this | This platform does it |
| Contracts with e-signature | Pixieset (3 free, unlimited paid), ShootProof (all plans), CloudSpot (Lite and up), Format (Pro) | Pic-Time, Pass, SmugMug, Zenfolio, PhotoShelter, Evlaa, Picflow, picdrop |
| Deposit now, balance later | Pixieset Studio Manager Pro, ShootProof invoices, CloudSpot payment schedules | Pure gallery tools |

## 4. Lightroom Classic plugins: who has what

Adobe's publish-service SDK exposes `getCommentsFromPublishedCollection`, `getRatingsFromPublishedCollection` and `addCommentToPublishedPhoto`, so two-way comments are supported by Lightroom itself (SDK reference: https://archive.stecman.co.nz/files/docs/lightroom-sdk/API-Reference/modules/SDK%20-%20Publish%20service%20provider.html; current SDK sample: https://github.com/Jaid/lightroom-sdk-8-examples). Almost nobody uses them for client proofing.

| Vendor | Publish service | Re-publish replaces in place | Client favorites back into Lightroom | Client comments back into Lightroom | Reply from Lightroom | Source |
| --- | --- | --- | --- | --- | --- | --- |
| This platform | Yes | Yes, keeps notes | Yes, as a keyword ("Client Favorite") plus rating 1 | Yes, Comments panel | Yes | `lightroom/meilechbiller.lrplugin` |
| Pixieset | Yes | Yes | No. "Lightroom Copy List" of filenames to paste into Library search | No | No | https://help.pixieset.com/hc/en-us/articles/115003505192 |
| Pic-Time | Yes | Yes | Yes, as collections under a Selections folder. Paid plans only. Not available on the new 2.0 galleries | No | No | https://help.pic-time.com/en/articles/7834728 |
| ShootProof | Yes, labeled third-party | Yes, by filename | No. Copy filenames from Gallery Visitors | No | No | https://help.shootproof.com/hc/en-us/articles/115009451587 |
| CloudSpot | Yes | Undocumented | No. "One-way sync", copy filenames | No | No | https://help.cloudspot.io/en/articles/114552 |
| Pass | Yes | Yes | Yes, "Sync Now" (appears to run on Pic-Time's engine) | No | No | https://servicehub.passgallery.com/setting-up-the-lightroom-plugin |
| SmugMug | Yes | Metadata only unless marked for republish | Indirect, favorites arrive as a synced gallery | Public site comments only | Yes, for site comments | https://www.smugmughelp.com/hc/en-us/articles/18212816221332 |
| Zenfolio | Yes | Yes | No. CSV or filename export | No | No | https://success.zenfolio.com/hc/en-us/articles/7430815097875 |
| Format | Yes | Unverified | Yes, as a white flag through the Comments panel | Favorites shown as comment entries; no client text | No | https://help.format.com/hc/en-us/articles/28139412923411 |
| PhotoShelter | Yes, but incompatible with Lightroom Classic 12.4 and later | Metadata first | No | No | No | https://support.photoshelter.com/hc/en-us/articles/203373590 |
| Picflow | Yes, versioned | Yes, keeps old version | No | No | No | https://help.picflow.com/en/articles/8630456 |
| picdrop | Export only, legacy accounts | No | No | No | No | https://www.picdrop.com/web/faq/lightroom |
| Sprout Studio | Yes | Unverified | Yes, "client favorites visible in Lightroom" (mechanism unverified) | Unverified | Unverified | https://getsproutstudio.com/lightroom-plugin/ |
| Evlaa | Yes, all plans | Yes | Yes | Claims "ratings and comments" sync; mechanism unverified | Unverified | https://www.evlaa.com/en |
| Piwigo (open source) | Yes, free | Yes | Not client-grade | Yes, Comments panel | Yes | https://github.com/Piwigo/PiwigoPublish-lrc-plugin |

Summary: publish and re-publish are table stakes. Favorites back into Lightroom exists at Pic-Time (paid, not on its new galleries), Pass, Format (flags) and Evlaa. Client comments in the Comments panel with a reply from Lightroom exists at Evlaa (claimed) and in the open-source Piwigo plugin, and at no major client-gallery vendor. Tagging favorites as a keyword, which lets photographers build smart collections and filters, was not found anywhere else.

Photographers do ask for this. ShootProof's own blog described marking client favorites back in Lightroom as taking about an hour per 300 to 600 photo job (https://www.shootproof.com/blog/shootproof-favorites-lightroom/). Lightroom Queen forum, 2018: "I'm in desperate need of a streamlined method for sending proofs to clients for them to select, with those selections being tagged in Lightroom" (https://www.lightroomqueen.com/community/threads/in-need-of-a-streamlined-method-for-sending-proofs-to-clients.34455/). Adobe Community, 2023, a headshot-style case of 3 to 5 photos per person, wanted favorites to "automatically come back" into Lightroom Classic (https://community.adobe.com/t5/lightroom-ecosystem-cloud-based-discussions/need-to-create-a-gallery-that-clients-can-use-to-choose-photos-for-editing/m-p/13525682).

Plugin risk: Pixieset's plugin broke on Lightroom Classic 13.0.1 (https://www.lightroomqueen.com/community/threads/pixieset-plugin-publish-error.48708/) and PhotoShelter's has been incompatible since 12.4. A plugin is a support commitment tied to Adobe's release schedule.

## 5. Studio-management (CRM) competitors

| Product | Price | Contracts | Deposit then balance | Native galleries | Lightroom | Source |
| --- | --- | --- | --- | --- | --- | --- |
| HoneyBook | $29 / $49 / $109 annual, plus 2.7% + 10¢ card fees | Yes | Yes | Yes since July 2026 (favorites, downloads; comments unverified) | No | https://www.honeybook.com/pricing |
| Studio Ninja | $16 / $27 / $40 | Yes | Yes | No, integrates Pic-Time and ShootProof | No | https://www.studioninja.co/pricing/ |
| Sprout Studio | $19 / $36 / $51 / $69 annual | Yes | Yes | Yes | Yes, official plugin | https://getsproutstudio.com/pricing/ |
| Táve (now VSCO Workspace) | Only sold inside VSCO One at $499.99 a year | Yes | Unverified | Bundle only | Editing import only | https://www.vsco.co/subscribe/plans |
| 17hats | $60, $600 a year | Yes | Yes | No, ShootProof orders import | No | https://www.17hats.com/pricing |
| Dubsado | $335 / $525 a year | Yes | Yes | No, paste a link | No | https://www.dubsado.com/pricing |
| Iris Works | $14.95 to $49.95 | Yes | Yes | No, integrates Pic-Time and ShootProof | No | https://iris-works.com/pricing/ |
| Bloom.io | $14 / $34 / $66 list | Yes | Yes | Yes | No | https://bloom.io/pricing |
| Pixieset Studio Manager | Free / $12 / $18; Suite $28 to $55 | Yes | Yes (Pro) | Yes | Yes, one-way | https://pixieset.com/pricing-studio-manager/ |
| Session | $19, 3 GB storage | Yes, at booking | Yes | Yes, soft proofing | No | https://www.usesession.com/pricing |

Only Sprout Studio and Pixieset combine a CRM, native galleries and a Lightroom plugin, and both plugins are one-way for comments. Studio Ninja is the only CRM whose positioning names "corporate headshots" (https://www.studioninja.co/features/). Session is the tool most visibly used for headshot mini-session booking pages.

## 6. Headshot-specific tools

| Product | What it does | Price | Lightroom | Source |
| --- | --- | --- | --- | --- |
| Headshot Tools | Team headshot days: sign-up forms, CSV import, live queue, auto-rename to subject name, one branded gallery per person, retouch selection with limits, retouch upsell payments | $59 flat | No plugin, tether-based | https://www.headshottools.com/ |
| GotPhoto | Volume platform with a headshots vertical: QR cards sort into per-person galleries | Free (12% fee), $9.90 (9%), $49.90 (7%) | Upload-only plugin | https://www.gotphoto.com/headshots/ |
| Headshot Scheduler | Booking pages for headshot days | Unverified | No | https://headshotscheduler.com/ |
| HeadshotPro (AI) | Competes with photographers: AI headshots pushed to HR systems | From $39 per person | n/a | https://www.headshotpro.com/company-headshots |

Nobody combines per-person team galleries, an HR or office-manager master view, and a Lightroom plugin with favorites and comments sync. This platform has neither of the first two; the team-headshot workflow is a gap in both the market and the current code.

## 7. What photographers complain about

Ranked by frequency across Trustpilot, Capterra and forum reviews from 2024 to 2026:

1. Surprise price increases with short notice (SmugMug reviews, March to July 2026; Zenfolio storage price up 240%, October 2025).
2. Galleries disappearing: storage policy changes, auto-archive after inactivity, deletion after a late payment (Pic-Time reviews June and August 2026; Zenfolio archive tool).
3. Commission on sales stacked on a subscription (Pic-Time 6% to 15%, Zenfolio 7%, SmugMug 15%).
4. Upload failures (Pixieset, Pic-Time).
5. Back office missing or not connected to the gallery ("client gallery, contract, invoice don't all connect", ShootProof review, April 2025; Pic-Time review December 2025 asking for client management).
6. Lock-in and no bulk export.

Price sensitivity: portrait photographers tend to stay under $15 a month; a $55 to $75 a year increase caused public cancellations at SmugMug; wedding-volume users do pay $40 to $50 a month and call it a good investment. Sources: https://www.trustpilot.com/review/pic-time.com, https://www.trustpilot.com/review/www.smugmug.com, https://www.trustpilot.com/review/zenfolio.com, https://www.capterra.com/p/210015/ShootProof/reviews/.

## 8. What would have to change before offering this to anyone else

Findings from the code, in order of severity:

1. **Hosting terms.** Vercel's Hobby plan "is restricted to non-commercial personal use only" and lists "any method of requesting or processing payment from visitors of the site" and "receiving payment to create, update, or host the site" as commercial (https://vercel.com/docs/limits/fair-use-guidelines). A photographer taking deposits through this site, or anyone paying for the software, needs Vercel Pro at $20 per seat per month (https://vercel.com/pricing). The README's "runs entirely on free tiers" does not hold for any commercial use, including the current studio's own use.
2. **Storage limits are smaller than the README says.** Vercel's pricing page lists Hobby Blob at 1 GB storage and 10 GB transfer a month, not 5 GB and 100 GB. One headshot session of full-size JPEGs plus previews is roughly 0.5 to 2 GB. On Pro, Blob costs $0.023 per GB-month stored and from $0.05 per GB transferred (https://vercel.com/docs/vercel-blob/usage-and-pricing), so a photographer with 150 GB of galleries costs about $3.50 a month to store, which is workable at a $15 subscription.
3. **Single tenant.** One admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH`, no accounts or studio table, the studio name and legal name in `src/lib/site.ts`, the studio name in 9 source files, and the plugin identifies itself as `com.meilechbiller.lightroom.galleries` with the studio URL as its default. Serving other photographers means either one deployment per photographer (a template product) or adding accounts, per-studio branding, per-studio Stripe accounts and per-studio storage (a SaaS).
4. **No automated tests and no rate limiting** on public endpoints such as the access-code form and contact form. Acceptable for one studio, not for paying customers.
5. **Feature gaps versus the market:** no watermark on browser uploads, no mobile gallery app, no print sales, no slideshow, no team-headshot per-person galleries, no RAW or video, Resend's free tier caps at 100 emails a day (https://resend.com/pricing).
6. **Plugin support burden.** Adobe releases break plugins (section 4). Someone has to test each Lightroom Classic release.

## 9. Three ways to take it to market, and a recommendation

**A. Keep it as the studio's own tool.** Zero market risk. Move hosting to Vercel Pro to comply with the fair-use terms. This is the only option that requires no new work beyond that.

**B. Sell it as a deploy-it-yourself template.** No open-source or buy-once product was found that combines proofing, comments, payments, CRM and a two-way Lightroom plugin, and nothing like it exists on Gumroad, Lemon Squeezy or CodeCanyon. WordPress reference prices are picu Pro $149 a year, NextGEN Pro $139.50 a year, Modula lifetime $269 to $689. Each buyer would need their own Vercel Pro, Neon, Stripe and Resend accounts, so the audience is photographers comfortable with a 20-minute technical setup. Work required: strip the studio branding into config, rename the plugin, write setup docs, add tests. Revenue ceiling is low but so is the support burden.

**C. Run it as a subscription service.** This is where the incumbents are. Pricing would need to land at $10 to $20 a month for portrait and headshot photographers with a free tier, because that is what Pixieset, Pic-Time and CloudSpot charge and where portrait photographers' budgets sit. Differentiators that hold up: one tool instead of gallery plus CRM, zero commission, deposit and agreement built in, finals locked until paid, and the only two-way comment and keyword sync into Lightroom. Work required: multi-tenancy, Stripe Connect for per-photographer payouts, branded galleries and domains, a watermark pipeline, a mobile-friendly gallery app or PWA, billing, onboarding, support, and plugin QA on each Lightroom release. Evlaa, the closest analogue, reports 3,000 photographers after ten years, which is a realistic ceiling for a Lightroom-first niche product without a marketing budget.

**Recommendation.** Do A now (Vercel Pro is a compliance issue for the current studio, not a future one). Test demand for C cheaply before building it: strip the branding, put up a landing page describing the Lightroom round-trip and the one-tool workflow, and see whether headshot and portrait photographers sign up for a waitlist. If they do, B is a reasonable interim product that funds C. The team-headshot workflow (per-person galleries plus an office-manager pick view) is the one gap in the market that neither the incumbents nor this code covers, and it fits the studio's own business, so it is the first feature to add regardless of path.

## 10. Sources not otherwise linked above

- BLS Occupational Outlook, photographers: 145,000 jobs in 2025, 67% self-employed, median pay $44,660, projected minus 1% through 2035. https://www.bls.gov/ooh/media-and-communication/photographers.htm
- IBISWorld, US photography industry: $16.2 billion in 2025, 266,831 businesses. https://www.ibisworld.com/united-states/market-size/photography/1443/
- Pixieset scale: "more than 600,000 photographers" (2021 growth investment release). https://businesswire.com/news/home/20210913005506/en/Pixieset-Announces-Growth-Investment-From-Susquehanna-Growth-Equity
- Pic-Time: about 93 employees, no recorded funding, partnership (not acquisition) with Imagen. https://blog.pic-time.com/news/imagen-pic-time-integration/
- ShootProof: PSG-backed, merged into Foreground in 2018. https://www.crunchbase.com/organization/shootproof
- HoneyBook study, July 2026: 95% of photographers still manage workflows manually. https://www.globenewswire.com/news-release/2026/07/16/3328683/0/en/honeybook-study-finds-95-of-photographers-still-managing-workflows-and-client-relationships-manually.html
- Neon free tier: 0.5 GB storage per project. https://neon.com/pricing
- Stripe: 2.9% + 30¢ domestic cards. https://stripe.com/pricing
