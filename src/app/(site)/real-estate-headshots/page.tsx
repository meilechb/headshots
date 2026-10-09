import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "Real Estate Agent Headshots | Meilech Biller";
const description =
  "Realtor headshots that look like you on your best day, ready for signs, listings and Zillow. Studio or on-site. Proofs in about 1 to 2 business days.";

const faqs = [
  {
    q: "How much does a realtor headshot cost?",
    a: "See the pricing page for studio sessions. Brokerage and team sessions at your office are quoted by headcount and location.",
  },
  {
    q: "Can I use the photo on signs, Zillow and my brokerage website?",
    a: "Yes. Tell me where you'll use it and I'll deliver crops that fit, including a tight crop that holds up on yard signs and small profile photos.",
  },
  {
    q: "Can you photograph our whole brokerage?",
    a: "Yes. I come to your office and photograph everyone with the same background and lighting, and I can match the look for new agents later.",
  },
  {
    q: "How fast will I get my photos?",
    a: "Proofs in about 1 to 2 business days. You choose your finals from there.",
  },
  {
    q: "What should I wear?",
    a: "Solid colors and a fitted jacket or blouse usually work best. Bring a second, more relaxed outfit if you also want a photo for social media.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/real-estate-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/real-estate-headshots`,
  },
};

export default function RealEstateHeadshotsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Real estate agent headshots",
            serviceType: "Headshot photography",
            description,
            url: `${site.url}/real-estate-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Real estate headshots", path: "/real-estate-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Real estate agent headshots
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              In real estate, your face is on everything: the sign on the lawn, your listings, your
              Zillow profile, your business card. People pick an agent they feel they can trust,
              often before they ever talk. Your headshot should look like the person who shows up to
              the appointment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Book a session
              </Link>
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>
          </div>
          <div className="card p-6 sm:p-8" id="book">
            <h2 className="text-lg font-medium">Book a session</h2>
            <p className="mt-1 text-sm text-muted">
              Agent or brokerage? If it&apos;s a team, mention how many agents and where your office
              is.
            </p>
            <div className="mt-5">
              <ContactForm email={site.email} compact />
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2/50">
          <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-2 md:py-16">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Approachable beats perfect</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                A lot of realtor photos look either stiff or over-edited. When a buyer finally meets
                you, they should recognize you right away. I keep the retouching natural and focus
                on an expression that says &quot;easy to work with.&quot; Still professional, still
                you.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">One photo, every place you market</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Before we shoot, tell me where the photo is going: yard signs, listing flyers,
                Zillow and Realtor.com, your brokerage&apos;s site, Instagram, email signature.
                I&apos;ll make sure you get crops that work for each, including a tight crop that
                still reads clearly at small sizes on a sign or a profile thumbnail.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">For individual agents</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Come to the studio in Spring Valley for a session. It takes about 30 to 90 minutes
                depending on how many looks you want. A blazer for listings and something a little
                more relaxed for social media is a common combination.{" "}
                <Link href="/pricing" className="underline hover:text-brass-2">
                  See pricing
                </Link>{" "}
                for studio sessions, and proofs are ready in about 1 to 2 business days.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">For brokerages and teams</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                If your office wants every agent to match on the website and in your marketing, I
                can come to your office and photograph the whole roster in one visit with the same
                background and light. When new agents join later, I can match the same look so the
                roster stays consistent. Team bookings are quoted by headcount and location. For
                more on how a team day works, see{" "}
                <Link href="/team-headshots" className="underline hover:text-brass-2">
                  team headshots
                </Link>
                .
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">How a session goes</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Tell me where the photo will be used and what you plan to wear. At the session
                I&apos;ll guide your posture and expression, and we look at the shots together on
                the laptop as we go, so you see what&apos;s working. Afterward you pick your
                favorites from the proofs and I deliver your finals.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Need a LinkedIn photo too?</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                The same session can cover your LinkedIn photo. See{" "}
                <Link href="/linkedin-headshots" className="underline hover:text-brass-2">
                  LinkedIn headshots
                </Link>{" "}
                for what that looks like.
              </p>
            </div>
          </div>
        </section>

        <section>
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
              Ready for a headshot that looks like you at the closing table?{" "}
              <Link href="/contact" className="underline hover:text-brass-2">
                Get in touch
              </Link>{" "}
              or email {site.email}. I reply within one business day.
            </p>
          </div>
        </section>
      </article>
    </>
  );
}
