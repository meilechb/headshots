import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { areas, getArea } from "@/lib/areas";
import { getActivePackages, getFeaturedPortfolio } from "@/lib/data/public";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

type Props = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return areas.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) return {};
  return {
    title: { absolute: area.title },
    description: area.description,
    alternates: { canonical: `/headshots/${area.slug}` },
    openGraph: { title: area.title, description: area.description, url: `${site.url}/headshots/${area.slug}` },
  };
}

/**
 * Local landing page. Reached from search results and the sitemap; not linked
 * from the site navigation. Everything a visitor needs to book is on the page.
 */
export default async function AreaPage({ params }: Props) {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const [featured, packages] = await Promise.all([getFeaturedPortfolio(3), getActivePackages()]);
  const neighbors = area.neighbors.map(getArea).filter((a) => a !== undefined);
  const phoneHref = site.phone ? `tel:${site.phone.replace(/[^+\d]/g, "")}` : null;

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(area),
          faqJsonLd(area.faq),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: area.heading, path: `/headshots/${area.slug}` },
          ]),
        ]}
      />
      <article>
        {/* Top */}
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{area.heading}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">{area.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="btn-primary">Book a session</a>
              {phoneHref ? (
                <a href={phoneHref} className="btn-secondary">Call {site.phone}</a>
              ) : (
                <a href={`mailto:${site.email}`} className="btn-secondary">Email {site.email}</a>
              )}
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6 text-sm">
              <div>
                <dt className="text-muted">From</dt>
                <dd className="mt-1 font-medium">{packages[0] ? formatMoney(packages[0].price_cents) : "$295"}</dd>
              </div>
              <div>
                <dt className="text-muted">Proofs</dt>
                <dd className="mt-1 font-medium">1–2 business days</dd>
              </div>
              <div>
                <dt className="text-muted">Travel fee</dt>
                <dd className="mt-1 font-medium">None in Rockland</dd>
              </div>
            </dl>
          </div>
          <div className="card p-6 sm:p-8" id="book">
            <h2 className="text-lg font-medium">Book in {area.name}</h2>
            <p className="mt-1 text-sm text-muted">I reply within one business day with dates and a price.</p>
            <div className="mt-5">
              <ContactForm
                packages={packages.map((p) => ({ slug: p.slug, name: p.name }))}
                email={site.email}
                defaultTown={area.slug === "rockland-county" || area.slug === "ramapo" ? "" : area.name}
                defaultLocation={area.defaultLocation === "either" ? "" : area.defaultLocation}
                compact
              />
            </div>
          </div>
        </section>

        {/* Local detail */}
        <section className="border-y border-line bg-paper-2/50">
          <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-2 md:py-16">
            {area.sections.map((s) => (
              <div key={s.heading}>
                <h2 className="font-display text-2xl tracking-tight">{s.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-ink-2">
                  {s.paragraphs.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Work */}
        {featured.length ? (
          <section className="container-x py-14 md:py-16" aria-labelledby={`${area.slug}-work`}>
            <h2 id={`${area.slug}-work`} className="font-display text-2xl tracking-tight">Recent headshots</h2>
            <div className="mt-6">
              <PortfolioGrid
                images={featured.map((f) => ({ id: f.id, url: f.url, alt: f.alt, width: f.width, height: f.height }))}
                limit={3}
              />
            </div>
            <Link href="/portfolio" className="btn-ghost mt-4">More photos →</Link>
          </section>
        ) : null}

        {/* Pricing */}
        {packages.length ? (
          <section className="container-x py-14 md:py-16" aria-labelledby={`${area.slug}-pricing`}>
            <h2 id={`${area.slug}-pricing`} className="font-display text-2xl tracking-tight">Pricing in {area.name}</h2>
            <p className="mt-3 max-w-xl text-sm text-ink-2">
              Same price in the studio and on-site anywhere in Rockland County. Retouching, an online proof gallery and full-resolution files are included in every package.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p) => (
                <li key={p.id} className={`card flex flex-col p-5 ${p.is_featured ? "border-ink" : ""}`}>
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 font-display text-3xl">
                    {formatMoney(p.price_cents)}
                    {p.slug === "team" ? <span className="ml-1 text-sm text-muted">/ person</span> : null}
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm text-ink-2">
                    {p.includes.slice(0, 3).map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <a href="#book" className={`mt-5 ${p.is_featured ? "btn-primary" : "btn-secondary"}`}>Book {p.name}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* FAQ */}
        <section className="border-t border-line bg-paper-2/50" aria-labelledby={`${area.slug}-faq`}>
          <div className="container-x py-14 md:py-16">
            <h2 id={`${area.slug}-faq`} className="font-display text-2xl tracking-tight">Questions from {area.name}</h2>
            <dl className="mt-4 max-w-3xl divide-y divide-line">
              {area.faq.map((f) => (
                <div key={f.q} className="py-4">
                  <dt className="font-medium">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-6 text-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Close */}
        <section className="container-x py-14 md:py-16">
          <h2 className="font-display text-2xl tracking-tight">Ready to book?</h2>
          <p className="mt-3 max-w-xl text-ink-2">
            Send the form above with a few dates that work, or email{" "}
            <a href={`mailto:${site.email}`} className="underline hover:text-brass-2">{site.email}</a>. I reply within one business day.
          </p>
          <a href="#book" className="btn-primary mt-6">Book a session in {area.name}</a>
          {area.zips.length ? (
            <p className="mt-8 text-xs text-muted">Serving {area.fullName}{area.zips.length ? ` (${area.zips.join(", ")})` : ""} and nearby: {neighbors.map((n) => n.name).join(", ")}.</p>
          ) : (
            <p className="mt-8 text-xs text-muted">Also serving: {neighbors.map((n) => n.name).join(", ")}.</p>
          )}
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {neighbors.map((n) => (
              <li key={n.slug}>
                <Link href={`/headshots/${n.slug}`} className="text-muted underline hover:text-ink">Headshots in {n.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
