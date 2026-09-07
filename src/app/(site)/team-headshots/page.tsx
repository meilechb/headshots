import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { linkedAreas } from "@/lib/area-nav";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "Team & Corporate Headshots in Rockland County, NY | Meilech Biller";
const description =
  "Team headshots for Rockland offices that stand out — consistent, not cookie-cutter. On-site or studio. No Rockland travel fee.";

const faqs = [
  {
    q: "How many people per hour?",
    a: "Depends on wardrobe and headcount — share numbers and I’ll propose a schedule.",
  },
  {
    q: "Do individuals get three finals on a team day?",
    a: "Team days are quoted custom. Individual $250 sessions always include three finals. Ask if you want that structure mixed in.",
  },
  {
    q: "Can you match brand colors?",
    a: "Yes via wardrobe guidance and a simple backdrop — send guidelines if you have them.",
  },
  {
    q: "What’s the turnaround?",
    a: "Proofs typically within a few business days; larger sets may take longer — set in the quote.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/team-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/team-headshots`,
  },
};

export default function TeamHeadshotsPage() {
  const areas = linkedAreas();
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Team and corporate headshots in Rockland County",
            serviceType: "Team headshot photography",
            description,
            url: `${site.url}/team-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Team headshots", path: "/team-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Team and corporate headshots in Rockland County
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              A team page full of mismatched selfies makes the brand look unfinished. I shoot
              consistent sets for Rockland offices — same light language, same quality bar — so
              everyone looks like they belong together <strong>and</strong> still stands out as a
              person, not a template.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Request a team quote
              </Link>
              <Link href="/pricing" className="btn-secondary">
                Individuals: $250 / 3 finals
              </Link>
            </div>
          </div>
          <div className="card p-6 sm:p-8" id="book">
            <h2 className="text-lg font-medium">Plan a team day</h2>
            <p className="mt-1 text-sm text-muted">Mention headcount and location in your message.</p>
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
                Offices, medical and dental practices, real estate teams, synagogues and community
                orgs, startups, and law firms that want a clean, matching set that doesn’t look
                mass-produced.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">On-site or studio</h2>
              <ul className="mt-3 space-y-1.5 text-sm leading-7 text-ink-2">
                <li>
                  <strong>On-site:</strong> I come to your Rockland office — no travel fee in
                  Rockland County
                </li>
                <li>
                  <strong>Studio:</strong> Spring Valley — good when people can rotate through a
                  quiet room
                </li>
              </ul>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Share headcount and whether you want a simple backdrop or a light branded look.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Consistent — not cookie-cutter</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Same lighting and framing so the website and LinkedIn feel like one company. Within
                that system, each person still looks like themselves — not stamped from the same
                mold.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Pricing</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Individual studio sessions are <strong>$250</strong> and include{" "}
                <strong>three final images</strong>. Team and on-site days are custom — reach out
                with headcount and location and we’ll quote. Use the{" "}
                <Link href="/contact" className="underline hover:text-brass-2">
                  contact form
                </Link>{" "}
                (mention “team”) or email {site.email}.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Office checklist</h2>
              <ul className="mt-3 space-y-1.5 text-sm leading-7 text-ink-2">
                <li>Simple wardrobe note (solids / brand colors if you have them)</li>
                <li>Short calendar blocks per person</li>
                <li>Quiet room with a clean wall, or ask about outdoor options</li>
                <li>Decide crops: website + LinkedIn, or LinkedIn only</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Also individual LinkedIn refreshes</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                See{" "}
                <Link href="/linkedin-headshots" className="underline hover:text-brass-2">
                  LinkedIn headshots
                </Link>{" "}
                for one-person sessions.
              </p>
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
              Planning a team day?{" "}
              <Link href="/contact" className="underline hover:text-brass-2">
                Request a quote
              </Link>{" "}
              or email {site.email}.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
