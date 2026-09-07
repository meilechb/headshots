import Image from "next/image";
import Link from "next/link";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { getFeaturedPortfolio } from "@/lib/data/public";
import { getHeroImage } from "@/lib/data/settings";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [featured, chosenHero] = await Promise.all([getFeaturedPortfolio(6), getHeroImage()]);
  // Admin-chosen header image, otherwise the first featured portfolio photo.
  const hero = chosenHero ?? featured[0] ?? null;

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
        <div className="container-x relative pb-14 pt-40 md:pb-20 md:pt-56">
          <h1 className="max-w-3xl font-display text-4xl leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Stand out from the crowd
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/80">
            Professional headshots in Rockland County, NY.
          </p>
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

      {/* Contact */}
      <section className="border-t border-line">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-10 text-sm">
          <Link href="/contact" className="btn-primary">
            Send a message
          </Link>
          <a href={`mailto:${site.email}`} className="text-ink-2 underline hover:text-ink">
            {site.email}
          </a>
        </div>
      </section>
    </>
  );
}
