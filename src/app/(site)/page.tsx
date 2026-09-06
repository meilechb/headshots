import Image from "next/image";
import Link from "next/link";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { JsonLd } from "@/components/seo/json-ld";
import type { Faq } from "@/lib/areas";
import { getActivePackages, getFeaturedPortfolio } from "@/lib/data/public";
import { faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

const steps = [
  {
    title: "Book",
    body: "Send the form or an email. I reply within one business day with dates, and you pick a package.",
  },
  {
    title: "Session",
    body: "30 to 90 minutes in the studio or at your office. I direct posture and expression; you do not need experience in front of a camera.",
  },
  {
    title: "Pick and download",
    body: "Proofs go into a private online gallery within a day or two. Mark the ones you want, and the retouched files are ready to download a few days later.",
  },
];

const faqs: Faq[] = [
  {
    q: "Where are sessions held?",
    a: `Individual sessions are in my studio in ${site.address.locality}, NY. Team and office sessions are on-site anywhere in Rockland County, with no travel fee.`,
  },
  {
    q: "How long until I get the photos?",
    a: "Proofs are online within one or two business days. Retouched finals follow within two to three business days after you pick.",
  },
  {
    q: "What does it cost?",
    a: "Individual sessions start at $295. Team sessions are priced per person with a five-person minimum. Every package includes retouching and full-resolution files.",
  },
  {
    q: "What should I wear?",
    a: "Solid colors in tones you wear to work, well fitted. Bring two or three options and we choose together at the start.",
  },
];

export default async function HomePage() {
  const [featured, packages] = await Promise.all([
    getFeaturedPortfolio(6),
    getActivePackages(),
  ]);
  const hero = featured[0];

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />

      {/* Intro */}
      <section className="container-x grid grid-cols-1 items-center gap-10 pb-16 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
        <div>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Professional headshots in Rockland County, NY
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink-2">
            I photograph headshots for business, LinkedIn, teams and actors.
            Sessions are in my studio in {site.address.locality} or at your
            office anywhere in Rockland County. Photos are delivered online
            within a few days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Book a session
            </Link>
            <Link href="/portfolio" className="btn-secondary">
              See photos
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">Turnaround</dt>
              <dd className="mt-1 font-medium">2–3 business days</dd>
            </div>
            <div>
              <dt className="text-muted">Where</dt>
              <dd className="mt-1 font-medium">Studio or your office</dd>
            </div>
            <div>
              <dt className="text-muted">Delivery</dt>
              <dd className="mt-1 font-medium">Online gallery</dd>
            </div>
          </dl>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-paper-3">
          {hero ? (
            <Image
              src={hero.url}
              alt={hero.alt || `Headshot photographed by ${site.name} in Rockland County, NY`}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              fetchPriority="high"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#1c1c1e,#1c1c1e_14px,#161618_14px,#161618_28px)]">
              <div className="absolute inset-x-0 bottom-0 p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Your photo goes here
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent work */}
      <section className="container-x py-16" aria-labelledby="recent-work">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="recent-work" className="font-display text-3xl tracking-tight sm:text-4xl">
            Recent work
          </h2>
          <Link href="/portfolio" className="btn-ghost hidden sm:inline-flex">
            All photos →
          </Link>
        </div>
        <PortfolioGrid
          images={featured.map((f) => ({
            id: f.id,
            url: f.url,
            alt: f.alt,
            width: f.width,
            height: f.height,
          }))}
          limit={6}
        />
        <Link href="/portfolio" className="btn-secondary mt-8 sm:hidden">
          All photos
        </Link>
      </section>

      {/* Process */}
      <section className="border-y border-line bg-paper-2/50" aria-labelledby="how-it-works">
        <div className="container-x py-16 md:py-20">
          <h2 id="how-it-works" className="font-display text-3xl tracking-tight sm:text-4xl">
            How it works
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="font-display text-4xl text-brass">{i + 1}</span>
                <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section className="container-x py-16 md:py-20" aria-labelledby="pricing">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h2 id="pricing" className="font-display text-3xl tracking-tight sm:text-4xl">
              Pricing
            </h2>
            <p className="mt-3 max-w-xl text-ink-2">
              Every package includes retouching, an online proof gallery and
              full-resolution files. Prices are the same anywhere in Rockland
              County.
            </p>
          </div>
          <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">
            All packages →
          </Link>
        </div>
        {packages.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {packages.slice(0, 3).map((p) => (
              <div key={p.id} className={`card relative flex flex-col p-6 ${p.is_featured ? "border-ink" : ""}`}>
                {p.is_featured ? (
                  <span className="absolute right-3.5 top-3.5 bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-paper">
                    Most booked
                  </span>
                ) : null}
                <h3 className="text-lg font-medium">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
                <p className="mt-6 font-display text-4xl">{formatMoney(p.price_cents)}</p>
                <ul className="mt-6 space-y-2 text-sm text-ink-2">
                  {p.includes.slice(0, 4).map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-brass">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link href={`/contact?package=${p.slug}`} className="btn-secondary mt-8">
                  Book {p.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Packages are listed on the pricing page.</p>
        )}
        <Link href="/pricing" className="btn-secondary mt-6 sm:hidden">
          All packages
        </Link>
      </section>

      {/* FAQ */}
      <section className="container-x py-16 md:py-20" aria-labelledby="faq">
        <h2 id="faq" className="font-display text-3xl tracking-tight sm:text-4xl">
          Common questions
        </h2>
        <dl className="mt-8 max-w-3xl divide-y divide-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm leading-6 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-ink-2">
          Anything else?{" "}
          <Link href="/contact" className="underline hover:text-brass-2">
            Send a message
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${site.email}`} className="underline hover:text-brass-2">
            {site.email}
          </a>
          .
        </p>
      </section>
    </>
  );
}
