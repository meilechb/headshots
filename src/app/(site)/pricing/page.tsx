import type { Metadata } from "next";
import Link from "next/link";
import { getActivePackages } from "@/lib/data/public";
import { formatMoney } from "@/lib/types";

export const metadata: Metadata = {
  title: "Headshot Pricing, Rockland County, NY",
  description:
    "Individual headshot $250 at the studio in Spring Valley, NY — includes three final images. Custom team packages across Rockland County.",
  alternates: { canonical: "/pricing" },
};

// Re-check the database at most every 5 minutes; admin saves also refresh these pages.
export const revalidate = 300;

const faqs = [
  {
    q: "What’s included in the $250 session?",
    a: "Studio time plus three final images. Need more images or something custom? Reach out.",
  },
  {
    q: "Do you shoot teams?",
    a: "Yes — on-site or studio. Team days are quoted custom; see team headshots for details.",
  },
  {
    q: "Is there a travel fee in Rockland?",
    a: "No Rockland County travel fee for on-site sessions.",
  },
  {
    q: "How fast are proofs?",
    a: "Usually about 1–2 business days for individuals; larger team sets are set in the quote.",
  },
];

export default async function PricingPage() {
  const packages = await getActivePackages();

  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Pricing</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-2">
        Individual studio sessions are <strong>$250</strong> and include{" "}
        <strong>three final images</strong>. Built so you stand out — not cookie-cutter.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-ink-2">
        Looking for{" "}
        <Link href="/linkedin-headshots" className="underline hover:text-brass-2">
          LinkedIn headshots
        </Link>{" "}
        or{" "}
        <Link href="/team-headshots" className="underline hover:text-brass-2">
          team headshots
        </Link>
        ?
      </p>
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {packages.map((p) => (
          <div key={p.id} className="card flex flex-col p-6 sm:p-8">
            <h2 className="text-lg font-medium">{p.name}</h2>
            <p className="mt-4 font-display text-4xl">{p.price_cents > 0 ? formatMoney(p.price_cents) : "Custom"}</p>
            {p.description ? <p className="mt-3 text-ink-2">{p.description}</p> : null}
            {p.includes.length ? (
              <ul className="mt-4 space-y-1.5 text-sm text-ink-2">
                {p.includes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            <Link href="/contact" className="btn-primary mt-8 self-start">
              {p.price_cents > 0 ? "Book" : "Get a quote"}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-line pt-12">
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
          Ready to book?{" "}
          <Link href="/contact" className="underline hover:text-brass-2">
            Get in touch
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
