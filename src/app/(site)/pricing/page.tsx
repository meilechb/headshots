import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import type { Faq } from "@/lib/areas";
import { getActivePackages } from "@/lib/data/public";
import { faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

export const metadata: Metadata = {
  title: "Headshot Pricing and Packages, Rockland County, NY",
  description:
    "Headshot session prices in Rockland County, NY. Individual sessions from $295, team sessions per person. Retouching, online proof gallery and full-resolution files included.",
  alternates: { canonical: "/pricing" },
};

const faqs: Faq[] = [
  {
    q: "How do I pay?",
    a: "After we confirm a date you get a payment link. Cards, Apple Pay and Google Pay are accepted. Payment is due before the session.",
  },
  {
    q: "Is there a travel fee?",
    a: "No travel fee anywhere in Rockland County. For Bergen County, NJ or Westchester, ask and I will quote it.",
  },
  {
    q: "What should I wear?",
    a: "Solid colors, well fitted, in tones you wear to work. Bring two or three options and we choose together.",
  },
  {
    q: "How do I get my photos?",
    a: "Proofs are posted to a private online gallery protected by a code. You mark the frames you want and leave notes. Retouched finals are delivered to the same gallery for download.",
  },
  {
    q: "Can I buy extra retouched images?",
    a: "Yes. Additional retouched images from your session can be added at any time after the proofs are posted.",
  },
  {
    q: "Can you photograph a whole team?",
    a: "Yes. Team sessions are at your office with a portable setup so every headshot matches. Five-person minimum; larger groups get a quote.",
  },
];

export default async function PricingPage() {
  const packages = await getActivePackages();

  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <section className="container-x py-14 md:py-20">
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Pricing</h1>
        <p className="mt-4 max-w-xl text-ink-2">
          Every package includes retouching, an online proof gallery, and
          full-resolution files for personal and business use. Prices are the
          same for the studio in {site.address.locality} and for on-location
          sessions anywhere in Rockland County.
        </p>

        {packages.length ? (
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <div key={p.id} className={`card relative flex flex-col p-6 ${p.is_featured ? "border-ink" : ""}`}>
                {p.is_featured ? (
                  <span className="absolute right-3.5 top-3.5 bg-ink px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-paper">
                    Most booked
                  </span>
                ) : null}
                <h2 className="text-lg font-medium">{p.name}</h2>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
                <p className="mt-6 font-display text-4xl">
                  {formatMoney(p.price_cents)}
                  {p.slug === "team" ? <span className="ml-1 text-base text-muted">/ person</span> : null}
                </p>
                {p.turnaround ? <p className="mt-1 text-xs text-muted">Delivered in {p.turnaround}</p> : null}
                <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-2">
                  {p.includes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-brass">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link href={`/contact?package=${p.slug}`} className={`mt-8 ${p.is_featured ? "btn-primary" : "btn-secondary"}`}>
                  Book {p.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted">Packages are being updated. Email {site.email} for current prices.</p>
        )}
      </section>

      <section className="border-t border-line bg-paper-2/50" aria-labelledby="pricing-faq">
        <div className="container-x grid grid-cols-1 gap-10 py-16 md:grid-cols-[0.8fr_1.2fr]">
          <h2 id="pricing-faq" className="font-display text-3xl tracking-tight">Questions</h2>
          <dl className="divide-y divide-line">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
