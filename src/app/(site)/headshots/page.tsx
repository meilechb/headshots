import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { areas, townAreas } from "@/lib/areas";
import { breadcrumbJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Headshots in Rockland County, NY: Areas Served",
  description:
    "Headshot photography in Spring Valley, Monsey, Nanuet, New City, Airmont, Suffern and the Town of Ramapo. Studio sessions in Spring Valley, on-site team sessions anywhere in Rockland County.",
  alternates: { canonical: "/headshots" },
};

const types = [
  {
    name: "Business and LinkedIn headshots",
    body: "One person, 30 to 90 minutes, in the studio. For a profile photo, a company website, a bio page or a press kit.",
  },
  {
    name: "Team and office headshots",
    body: "On-site at your office. Same lighting and background for everyone so the staff page matches. Five-person minimum.",
  },
  {
    name: "Real estate and sales headshots",
    body: "Photos for listings, signs, business cards and social media. Several looks in one session are common.",
  },
  {
    name: "Medical and professional practice photos",
    body: "White coat, scrubs or business dress. Matching photos for directories and practice websites, on-site during the workday.",
  },
  {
    name: "Actor headshots",
    body: "Commercial and theatrical looks with natural light-style results, delivered in the crops casting sites ask for.",
  },
  {
    name: "Organization and school staff",
    body: "Staff photos for websites, handbooks and journals, done on-site so people rotate through in a morning.",
  },
];

export default function HeadshotsIndexPage() {
  const county = areas.find((a) => a.slug === "rockland-county")!;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Headshots", path: "/headshots" }])} />
      <section className="container-x py-14 md:py-20">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
          Headshots in Rockland County, NY
        </h1>
        <p className="mt-4 max-w-2xl text-ink-2">
          The studio is in {site.address.locality}. On-location sessions cover every
          town and village in Rockland County with no travel fee. Pick your area
          below for details, or read about{" "}
          <Link href={`/headshots/${county.slug}`} className="underline hover:text-brass-2">
            the county as a whole
          </Link>
          .
        </p>

        <h2 className="mt-14 font-display text-3xl tracking-tight">Areas</h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {townAreas.map((a) => (
            <li key={a.slug}>
              <Link href={`/headshots/${a.slug}`} className="card block p-5 transition hover:border-ink">
                <span className="block text-lg font-medium">{a.fullName}</span>
                <span className="mt-1 block text-sm text-muted">{a.local[0]}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-display text-3xl tracking-tight">Kinds of headshots</h2>
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {types.map((t) => (
            <div key={t.name} className="card p-5">
              <dt className="font-medium">{t.name}</dt>
              <dd className="mt-2 text-sm leading-6 text-muted">{t.body}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-12 text-ink-2">
          <Link href="/pricing" className="underline hover:text-brass-2">See pricing</Link> or{" "}
          <Link href="/contact" className="underline hover:text-brass-2">book a session</Link>.
        </p>
      </section>
    </>
  );
}
