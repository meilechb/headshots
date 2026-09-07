import type { Metadata } from "next";
import Link from "next/link";
import { getActivePackages } from "@/lib/data/public";
import { formatMoney } from "@/lib/types";

export const metadata: Metadata = {
  title: "Headshot Pricing, Rockland County, NY",
  description:
    "Individual headshot $250 at the studio in Spring Valley, NY. Custom packages on request anywhere in Rockland County.",
  alternates: { canonical: "/pricing" },
};

// Re-check the database at most every 5 minutes; admin saves also refresh these pages.
export const revalidate = 300;

export default async function PricingPage() {
  const packages = await getActivePackages();

  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Pricing</h1>
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
    </section>
  );
}
