import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
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

export default async function AreaPage({ params }: Props) {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();

  const [featured, packages] = await Promise.all([getFeaturedPortfolio(3), getActivePackages()]);
  const neighbors = area.neighbors.map(getArea).filter((a) => a !== undefined);

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd(area),
          faqJsonLd(area.faq),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Headshots", path: "/headshots" },
            { name: area.fullName, path: `/headshots/${area.slug}` },
          ]),
        ]}
      />
      <article className="container-x py-14 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted">
          <Link href="/" className="hover:text-ink">Home</Link> ›{" "}
          <Link href="/headshots" className="hover:text-ink">Headshots</Link> ›{" "}
          <span>{area.name}</span>
        </nav>
        <h1 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">{area.heading}</h1>
        <div className="mt-6 max-w-2xl space-y-4 leading-7 text-ink-2">
          {area.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Book a session</Link>
          <Link href="/pricing" className="btn-secondary">Pricing</Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
          <section aria-labelledby={`${area.slug}-local`}>
            <h2 id={`${area.slug}-local`} className="font-display text-2xl tracking-tight">
              Sessions in {area.name}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
              {area.local.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="text-brass">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            {area.zips.length ? (
              <p className="mt-4 text-xs text-muted">ZIP codes: {area.zips.join(", ")}</p>
            ) : null}
          </section>
          <section aria-labelledby={`${area.slug}-requests`}>
            <h2 id={`${area.slug}-requests`} className="font-display text-2xl tracking-tight">
              What people in {area.name} book
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-ink-2">
              {area.commonRequests.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="text-brass">—</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {featured.length ? (
          <section className="mt-16" aria-labelledby={`${area.slug}-work`}>
            <h2 id={`${area.slug}-work`} className="font-display text-2xl tracking-tight">Recent work</h2>
            <div className="mt-6">
              <PortfolioGrid
                images={featured.map((f) => ({ id: f.id, url: f.url, alt: f.alt, width: f.width, height: f.height }))}
                limit={3}
              />
            </div>
          </section>
        ) : null}

        {packages.length ? (
          <section className="mt-16" aria-labelledby={`${area.slug}-pricing`}>
            <h2 id={`${area.slug}-pricing`} className="font-display text-2xl tracking-tight">Pricing</h2>
            <p className="mt-3 max-w-xl text-sm text-ink-2">
              Same prices in {area.name} as everywhere in Rockland County. No travel fee.
            </p>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {packages.map((p) => (
                <li key={p.id} className="card p-4">
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 font-display text-2xl">
                    {formatMoney(p.price_cents)}
                    {p.slug === "team" ? <span className="ml-1 text-sm text-muted">/ person</span> : null}
                  </p>
                  <p className="mt-2 text-xs text-muted">{p.includes[0]}</p>
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="btn-ghost mt-4">Full package details →</Link>
          </section>
        ) : null}

        <section className="mt-16" aria-labelledby={`${area.slug}-faq`}>
          <h2 id={`${area.slug}-faq`} className="font-display text-2xl tracking-tight">Questions</h2>
          <dl className="mt-4 max-w-3xl divide-y divide-line">
            {area.faq.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16" aria-labelledby={`${area.slug}-nearby`}>
          <h2 id={`${area.slug}-nearby`} className="text-xs uppercase tracking-[0.2em] text-muted">Nearby</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {neighbors.map((n) => (
              <li key={n.slug}>
                <Link href={`/headshots/${n.slug}`} className="inline-flex min-h-10 items-center border border-line px-4 py-2 text-sm hover:border-ink">
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-14 text-ink-2">
          Ready to book in {area.name}?{" "}
          <Link href="/contact" className="underline hover:text-brass-2">Send the form</Link> or email{" "}
          <a href={`mailto:${site.email}`} className="underline hover:text-brass-2">{site.email}</a>.
        </p>
      </article>
    </>
  );
}
