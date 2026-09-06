import type { Metadata } from "next";
import { getActivePackages } from "@/lib/data/public";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Book a Headshot Session in Rockland County, NY",
  description: `Book a headshot session with ${site.name}. Studio in ${site.address.locality}, NY, or on-site at your office anywhere in Rockland County. Reply within one business day.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const [{ package: pkg }, packages] = await Promise.all([searchParams, getActivePackages()]);

  return (
    <section className="container-x grid grid-cols-1 gap-12 py-14 md:grid-cols-[0.8fr_1.2fr] md:py-20">
      <div>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Book a session</h1>
        <p className="mt-4 text-ink-2">
          Fill out the form or email me. I reply within one business day with
          dates and a price. There is no obligation.
        </p>
        <dl className="mt-10 space-y-5 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${site.email}`} className="font-medium hover:text-brass-2">{site.email}</a>
            </dd>
          </div>
          {site.phone ? (
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-1">
                <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} className="font-medium hover:text-brass-2">{site.phone}</a>
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Studio</dt>
            <dd className="mt-1 font-medium">
              {site.address.street ? `${site.address.street}, ` : ""}
              {site.address.locality}, {site.address.region}
              {site.address.postalCode ? ` ${site.address.postalCode}` : ""}
            </dd>
            <dd className="mt-1 text-muted">Exact directions come with your booking confirmation.</dd>
          </div>
          <div>
            <dt className="text-muted">On location</dt>
            <dd className="mt-1 font-medium">Offices anywhere in Rockland County, no travel fee</dd>
          </div>
          <div>
            <dt className="text-muted">Hours</dt>
            <dd className="mt-1 font-medium">Sunday to Thursday, plus Friday mornings. Evenings by arrangement.</dd>
          </div>
        </dl>
      </div>
      <ContactForm
        packages={packages.map((p) => ({ slug: p.slug, name: p.name }))}
        defaultPackage={pkg}
        email={site.email}
      />
    </section>
  );
}
