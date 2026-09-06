import Image from "next/image";
import Link from "next/link";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { getActivePackages, getFeaturedPortfolio } from "@/lib/data/public";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

const steps = [
  {
    title: "Book",
    body: "Pick a package, choose a date, and pay the deposit online. You get a short prep guide the same day.",
  },
  {
    title: "Shoot",
    body: "A relaxed session with direction on posture, expression and wardrobe. We review frames together as we go.",
  },
  {
    title: "Choose & receive",
    body: "Your proofs arrive in a private gallery. Leave notes on any frame, pick your favorites, and download the retouched finals.",
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
      {/* Hero */}
      <section className="container-x grid items-center gap-10 pb-16 pt-14 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
        <div>
          <p className="eyebrow">Headshot photography · {site.location}</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Headshots that look like you on your best day.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink-2">
            Clean, confident portraits for executives, teams, actors and
            founders. Book online, review proofs in a private gallery, and
            download retouched files within days.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              Book a session
            </Link>
            <Link href="/portfolio" className="btn-secondary">
              View portfolio
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">Turnaround</dt>
              <dd className="mt-1 font-medium">2–3 days</dd>
            </div>
            <div>
              <dt className="text-muted">Sessions</dt>
              <dd className="mt-1 font-medium">Studio or on-site</dd>
            </div>
            <div>
              <dt className="text-muted">Delivery</dt>
              <dd className="mt-1 font-medium">Private gallery</dd>
            </div>
          </dl>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-paper-3">
          {hero ? (
            <Image
              src={hero.url}
              alt={hero.alt}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              fetchPriority="high"
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#1c1c1e,#1c1c1e_14px,#161618_14px,#161618_28px)]">
              <div className="absolute inset-x-0 bottom-0 p-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Your hero image goes here
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured work */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Recent sessions
            </h2>
          </div>
          <Link href="/portfolio" className="btn-ghost hidden sm:inline-flex">
            Full portfolio →
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
          Full portfolio
        </Link>
      </section>

      {/* Process */}
      <section className="border-y border-line bg-paper-2/50">
        <div className="container-x py-16 md:py-20">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl tracking-tight sm:text-4xl">
            Simple from booking to download.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="font-display text-4xl text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Packages */}
      <section className="container-x py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Pricing</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Packages for every purpose
            </h2>
          </div>
          <Link href="/pricing" className="btn-ghost hidden sm:inline-flex">
            Compare all →
          </Link>
        </div>
        {packages.length ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {packages.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className={`card relative flex flex-col p-6 ${
                  p.is_featured ? "border-ink" : ""
                }`}
              >
                {p.is_featured ? (
                  <span className="absolute right-3.5 top-3.5 bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-paper">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-lg font-medium">{p.name}</h3>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
                <p className="mt-6 font-display text-4xl">
                  {formatMoney(p.price_cents)}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-ink-2">
                  {p.includes.slice(0, 4).map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-brass">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/contact?package=${p.slug}`}
                  className="btn-secondary mt-8"
                >
                  Book {p.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Packages will appear here once the database is connected.
          </p>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-[repeating-linear-gradient(135deg,#161618,#161618_16px,#121214_16px,#121214_32px)] py-20 text-center md:py-28">
        <div className="container-x">
          <h2 className="mx-auto max-w-[20ch] font-display text-4xl tracking-tight sm:text-5xl">
            Ready when you are.
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary">
              Get in touch
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-2">{site.email}</p>
        </div>
      </section>
    </>
  );
}
