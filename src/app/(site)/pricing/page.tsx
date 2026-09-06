import type { Metadata } from "next";
import Link from "next/link";
import { getActivePackages } from "@/lib/data/public";
import { formatMoney } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Headshot session packages with transparent pricing. Studio and on-location options, retouching included.",
};

const faqs = [
  {
    q: "How do I pay?",
    a: "After we confirm a date you receive a secure payment link. Cards, Apple Pay and Google Pay are accepted through Stripe.",
  },
  {
    q: "What should I wear?",
    a: "Solid colors, well-fitted, in tones you actually wear to work. Bring two or three options and we choose together.",
  },
  {
    q: "How do I get my photos?",
    a: "Proofs are posted to a private online gallery protected by an access code. You comment on the frames you like, then the retouched finals are delivered to the same gallery for download.",
  },
  {
    q: "Can you photograph our whole team?",
    a: "Yes. Team sessions happen at your office with a portable studio setup so every headshot matches.",
  },
];

export default async function PricingPage() {
  const packages = await getActivePackages();

  return (
    <>
      <section className="container-x py-14 md:py-20">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
          Clear packages. No surprise fees.
        </h1>
        <p className="mt-4 max-w-xl text-ink-2">
          Every package includes professional retouching, an online proof
          gallery with comments, and high-resolution files licensed for
          personal and business use.
        </p>

        {packages.length ? (
          <div className="mt-12 grid gap-5 lg:grid-cols-4 md:grid-cols-2">
            {packages.map((p) => (
              <div
                key={p.id}
                className={`card flex flex-col p-6 ${
                  p.is_featured ? "ring-2 ring-brass" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-medium">{p.name}</h2>
                  {p.is_featured ? (
                    <span className="badge border-brass/40 text-brass-2">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
                <p className="mt-6 font-display text-4xl">
                  {formatMoney(p.price_cents)}
                  {p.slug === "team" ? (
                    <span className="ml-1 text-base text-muted">/ person</span>
                  ) : null}
                </p>
                {p.turnaround ? (
                  <p className="mt-1 text-xs text-muted">
                    Delivered in {p.turnaround}
                  </p>
                ) : null}
                <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-2">
                  {p.includes.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="text-brass">—</span>
                      {line}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/contact?package=${p.slug}`}
                  className={`mt-8 ${p.is_featured ? "btn-primary" : "btn-secondary"}`}
                >
                  Book {p.name}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted">
            Packages will appear here once the database is connected and the
            seed has been applied.
          </p>
        )}
      </section>

      <section className="border-t border-line bg-paper-2/50">
        <div className="container-x grid gap-10 py-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">
              Before you book
            </h2>
          </div>
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
