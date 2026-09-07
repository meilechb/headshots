import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { linkedAreas } from "@/lib/area-nav";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "LinkedIn Headshots in Rockland County, NY | Meilech Biller";
const description =
  "LinkedIn headshots in Rockland County that make you stand out — not cookie-cutter. Spring Valley studio or on-site. $250 includes 3 final images.";

const faqs = [
  {
    q: "What should I wear?",
    a: "Solid colors, fitted jacket or blouse; avoid busy patterns and large logos. Bring a second option if you want.",
  },
  {
    q: "How many finals do I get?",
    a: "Three final images with the $250 session. Need more or something custom? Reach out.",
  },
  {
    q: "How long is a session?",
    a: "Usually about 30–90 minutes depending on looks and wardrobe changes.",
  },
  {
    q: "Can I wear glasses?",
    a: "Yes — we’ll watch for glare.",
  },
  {
    q: "How fast do I get photos?",
    a: "Proofs in about 1–2 business days; finals after you choose.",
  },
  {
    q: "Do you shoot teams?",
    a: "Yes — see team and corporate headshots.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/linkedin-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/linkedin-headshots`,
  },
};

export default function LinkedInHeadshotsPage() {
  const areas = linkedAreas();
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "LinkedIn headshots in Rockland County, NY",
            serviceType: "LinkedIn headshot photography",
            description,
            url: `${site.url}/linkedin-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
            offers: {
              "@type": "Offer",
              price: "250",
              priceCurrency: "USD",
              description: "Studio session including three final images",
            },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "LinkedIn headshots", path: "/linkedin-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              LinkedIn headshots in Rockland County, NY
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              Most headshots look the same. Mine are built so you{" "}
              <strong>stand out from the crowd</strong> — still professional, still you, just not
              the cookie-cutter look everyone else has.
            </p>
            <p className="mt-4 max-w-xl text-ink-2">
              Studio in Spring Valley or on-site across Rockland County.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Get in touch
              </Link>
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6 text-sm">
              <div>
                <dt className="text-muted">From</dt>
                <dd className="mt-1 font-medium">$250</dd>
              </div>
              <div>
                <dt className="text-muted">Finals</dt>
                <dd className="mt-1 font-medium">3 images</dd>
              </div>
              <div>
                <dt className="text-muted">Proofs</dt>
                <dd className="mt-1 font-medium">1–2 days</dd>
              </div>
            </dl>
          </div>
          <div className="card p-6 sm:p-8" id="book">
            <h2 className="text-lg font-medium">Book a LinkedIn session</h2>
            <p className="mt-1 text-sm text-muted">I reply within one business day.</p>
            <div className="mt-5">
              <ContactForm email={site.email} compact />
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2/50">
          <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-2 md:py-16">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Who this is for</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Job seekers, realtors, attorneys, medical and office staff, founders, and anyone
                refreshing a personal brand. If your face is how people meet you online, it should
                feel like you — not a template.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">What’s included ($250)</h2>
              <ul className="mt-3 space-y-1.5 text-sm leading-7 text-ink-2">
                <li>Studio session for $250</li>
                <li>
                  <strong>Three final images</strong> (retouched selects)
                </li>
                <li>Guidance on wardrobe and framing for LinkedIn</li>
                <li>Time for a few looks so we have options</li>
                <li>Proofs in about 1–2 business days</li>
              </ul>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Need something more custom, extra images, or a different setup? Reach out — we’ll
                figure it out.
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                On-site at Rockland offices available — no Rockland travel fee. Groups:{" "}
                <Link href="/team-headshots" className="underline hover:text-brass-2">
                  team headshots
                </Link>
                .
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Why not a phone selfie or AI</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Lighting, expression, and a look that actually fits you are what make someone pause
                on LinkedIn. AI and selfies tend toward the same face-in-a-blur look. A short
                session gets you images for LinkedIn, your site, and directories — one clear personal
                brand.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">How it works</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-ink-2">
                <li>
                  Book via the{" "}
                  <Link href="/contact" className="underline hover:text-brass-2">
                    contact form
                  </Link>{" "}
                  or email {site.email}
                </li>
                <li>Studio in Spring Valley, or I come to your office</li>
                <li>You pick from proofs</li>
                <li>You get three final images ready for LinkedIn and web</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="container-x py-14 md:py-16">
          <h2 className="font-display text-2xl tracking-tight">Areas served</h2>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link href={a.href} className="underline hover:text-brass-2">
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-line">
          <div className="container-x py-14 md:py-16">
            <h2 className="font-display text-2xl tracking-tight">FAQ</h2>
            <dl className="mt-8 space-y-6">
              {faqs.map((f) => (
                <div key={f.q}>
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-1 text-sm leading-7 text-ink-2">{f.a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-10 text-ink-2">
              Ready for a LinkedIn photo that stands out?{" "}
              <Link href="/contact" className="underline hover:text-brass-2">
                Get in touch
              </Link>{" "}
              or email {site.email}.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
