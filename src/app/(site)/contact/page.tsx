import type { Metadata } from "next";
import { getActivePackages } from "@/lib/data/public";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Book a session",
  description: `Book a headshot session with ${site.name}. Studio and on-location sessions in ${site.location}.`,
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const [{ package: pkg }, packages] = await Promise.all([
    searchParams,
    getActivePackages(),
  ]);

  return (
    <section className="container-x grid gap-12 py-14 md:grid-cols-[0.8fr_1.2fr] md:py-20">
      <div>
        <p className="eyebrow">Book a session</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          Tell me about the photos you need.
        </h1>
        <p className="mt-4 text-ink-2">
          I reply within one business day with available dates, a package
          suggestion and a short guide on what to wear.
        </p>
        <dl className="mt-10 space-y-5 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${site.email}`} className="font-medium hover:text-brass-2">
                {site.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Studio</dt>
            <dd className="mt-1 font-medium">{site.location}</dd>
          </div>
          <div>
            <dt className="text-muted">On location</dt>
            <dd className="mt-1 font-medium">
              Offices and events throughout the area
            </dd>
          </div>
        </dl>
      </div>
      <ContactForm
        packages={packages.map((p) => ({ slug: p.slug, name: p.name }))}
        defaultPackage={pkg}
      />
    </section>
  );
}
