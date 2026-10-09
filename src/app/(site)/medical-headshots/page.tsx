import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "Medical and Dental Headshots | Meilech Biller";
const description =
  "Headshots for doctors, dentists and practices, in a white coat, scrubs or business dress. On-site between patients or at my studio. Proofs in 1 to 2 days.";

const faqs = [
  {
    q: "How much do medical headshots cost?",
    a: "A studio session is $250 and includes three final images. On-site sessions at your practice are quoted based on how many providers and where you are.",
  },
  {
    q: "Can you photograph us at our practice?",
    a: "Yes. I set up in an exam room or office in about 20 minutes, and each provider takes about ten minutes, so it fits between patients.",
  },
  {
    q: "Should I wear a white coat or scrubs?",
    a: "Wear what patients see you in. White coat, scrubs and business dress all work. If you want both, bring both.",
  },
  {
    q: "Will the photos work for hospital and insurance directories?",
    a: "Tell me which directories you use and I'll deliver files in the sizes they ask for, plus a crop for your website.",
  },
  {
    q: "How fast will we get the photos?",
    a: "Proofs in about 1 to 2 business days. You pick your finals from there.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/medical-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/medical-headshots`,
  },
};

export default function MedicalHeadshotsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Medical and dental headshots",
            serviceType: "Headshot photography",
            description,
            url: `${site.url}/medical-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
            offers: {
              "@type": "Offer",
              price: "250",
              priceCurrency: "USD",
              description: "Studio session, includes three final images",
            },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Medical headshots", path: "/medical-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Headshots for doctors, dentists and medical practices
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              Before a new patient books, they usually look you up. They see your photo on the
              practice website, on a hospital or insurance directory, and on profiles like
              Healthgrades or Zocdoc. That photo should look like the person they&apos;ll meet in
              the exam room: professional, calm, and easy to talk to.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                Request a quote
              </Link>
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
            </div>
          </div>
          <div className="card p-6 sm:p-8" id="book">
            <h2 className="text-lg font-medium">Request a quote</h2>
            <p className="mt-1 text-sm text-muted">
              Tell me how many providers, where the practice is, and which directories the photos
              are for.
            </p>
            <div className="mt-5">
              <ContactForm email={site.email} compact />
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper-2/50">
          <div className="container-x grid grid-cols-1 gap-10 py-14 md:grid-cols-2 md:py-16">
            <div>
              <h2 className="font-display text-2xl tracking-tight">Who I photograph</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Doctors, dentists, specialists, nurse practitioners, hygienists and front desk
                staff. Practice owners who need one new photo, and groups that want every provider
                to match.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">White coat, scrubs or business dress</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Wear what patients see you in. I photograph every provider in the same light,
                whether that&apos;s a white coat, scrubs or business dress, so your providers page
                looks like one practice and not a collection of photos from different years.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Between patients, in your office</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Practices are busy, so I come to you. I set up in an exam room or office in about 20
                minutes with a background, two lights and a laptop. Each provider takes about ten
                minutes, so people can step in when they have a gap in their schedule. For one
                person, the studio in Spring Valley also works.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Sized for every directory</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Hospital directories, insurance networks and review sites all ask for something a
                little different. Tell me where the photos are going and I&apos;ll deliver files in
                the sizes those places ask for, plus a wider crop for your website.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">How a session goes</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                I&apos;ll guide your posture and expression, and we look at the shots together on
                the laptop as we go, so you can see what&apos;s working. Afterward you pick your
                favorites from the proofs and I deliver your finals.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Keeping the look when people join</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                When a new provider joins, I can match the same background, light and framing so
                they fit right in on the website.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Pricing and turnaround</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                A studio session is $250 and includes three final images. On-site sessions at your
                practice are quoted by headcount and location. Proofs are ready in about 1 to 2
                business days. Planning to photograph the whole staff in one day? See{" "}
                <Link href="/team-headshots" className="underline hover:text-brass-2">
                  team headshots
                </Link>
                .
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
              Need new photos for your providers page?{" "}
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
