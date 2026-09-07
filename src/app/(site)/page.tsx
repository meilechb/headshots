import Image from "next/image";
import Link from "next/link";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { getFeaturedPortfolio, getReviews } from "@/lib/data/public";
import { ContactForm } from "./contact/contact-form";
import { getHeroImage } from "@/lib/data/settings";
import { linkedAreas } from "@/lib/areas";
import { site } from "@/lib/site";

// Re-check the database at most every 5 minutes; admin saves also refresh these pages.
export const revalidate = 300;

export default async function HomePage() {
  const [featured, chosenHero, reviews] = await Promise.all([getFeaturedPortfolio(6), getHeroImage(), getReviews()]);
  // Admin-chosen header image, otherwise the first featured portfolio photo.
  const hero = chosenHero ?? featured[0] ?? null;
  const areas = linkedAreas();

  return (
    <>
      {/* Header: one full-width image with the text on top */}
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-paper-3 md:min-h-[86svh]">
        {hero ? (
          <Image
            src={hero.url}
            alt={hero.alt || `Headshot photographed by ${site.name} in Rockland County, NY`}
            fill
            priority
            sizes="100vw"
            quality={85}
            className="object-cover object-[center_30%]"
          />
        ) : (
          <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#1c1c1e,#1c1c1e_14px,#161618_14px,#161618_28px)]" />
        )}
        {/* Darkens the lower half so the text stays readable on any photo. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/55 to-[#0d0d0e]/10" aria-hidden />
        <div className="container-x relative pb-14 pt-36 md:pb-20 md:pt-52">
          <h1 className="max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Professional headshots in Rockland County, NY
          </h1>
          <h2 className="mt-5 max-w-lg text-lg font-normal leading-8 text-white/80">
            Stand out from the crowd
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary bg-white text-[#0d0d0e] hover:bg-white/85 hover:text-[#0d0d0e]">
              Get in touch
            </Link>
            <Link href="/portfolio" className="btn-secondary border-white/40 text-white hover:bg-white hover:text-[#0d0d0e]">
              Portfolio
            </Link>
          </div>
          {!hero ? (
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
              Header image: set one in Admin → Portfolio
            </p>
          ) : null}
        </div>
      </section>

      {/* Recent work */}
      <section className="container-x py-16" aria-labelledby="recent-work">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="recent-work" className="font-display text-3xl tracking-tight sm:text-4xl">
            Recent work
          </h2>
          <Link href="/portfolio" className="btn-ghost hidden sm:inline-flex">
            See more →
          </Link>
        </div>
        <PortfolioGrid
          images={featured.map((f) => ({ id: f.id, url: f.url, alt: f.alt, width: f.width, height: f.height }))}
          limit={6}
        />
        <Link href="/portfolio" className="btn-secondary mt-8 sm:hidden">
          See more
        </Link>
      </section>

      {/* Areas we serve */}
      <section className="border-t border-line" aria-labelledby="areas-we-serve">
        <div className="container-x py-16">
          <h2 id="areas-we-serve" className="font-display text-3xl tracking-tight sm:text-4xl">
            Areas we serve
          </h2>
          <p className="mt-3 max-w-2xl text-ink-2">
            Studio sessions in Spring Valley and on-site headshots across Rockland County — no travel fee in the county.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {areas.map((a) => (
              <li key={a.slug}>
                <Link
                  href={a.href}
                  className="card flex h-full items-center px-4 py-3 text-sm font-medium hover:border-ink hover:text-brass-2"
                >
                  {a.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      {reviews.length ? (
        <section className="border-t border-line" aria-labelledby="reviews">
          <div className="container-x py-16">
            <h2 id="reviews" className="font-display text-3xl tracking-tight sm:text-4xl">
              Reviews
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.id} className="card flex flex-col p-6">
                  <p className="text-brass-2" aria-label="5 stars">★★★★★</p>
                  <p className="mt-3 flex-1 text-ink-2">{r.body}</p>
                  <p className="mt-4 text-sm font-medium">{r.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Contact */}
      <section className="border-t border-line" aria-labelledby="contact">
        <div className="container-x max-w-2xl py-16">
          <h2 id="contact" className="font-display text-3xl tracking-tight sm:text-4xl">
            Contact
          </h2>
          <div className="mt-8">
            <ContactForm email={site.email} />
          </div>
        </div>
      </section>
    </>
  );
}
