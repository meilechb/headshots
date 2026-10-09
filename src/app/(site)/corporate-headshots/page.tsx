import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "Corporate and Executive Headshots | Meilech Biller";
const description =
  "Corporate and executive headshots for offices, accounting, insurance and finance firms. Studio or on-site. Proofs in about 1 to 2 business days.";

const faqs = [
  {
    q: "How much do corporate headshots cost?",
    a: "On-site sessions are quoted based on headcount and location. See the pricing page for studio sessions.",
  },
  {
    q: "Can you match our company's existing headshots?",
    a: "Yes. Send me a link to your current team or leadership page and I'll match the background, lighting and framing so new photos fit with the old ones.",
  },
  {
    q: "Do you come to our office?",
    a: "Yes. I set up quickly in a spare room or office and work around your schedule.",
  },
  {
    q: "How fast do we get the photos?",
    a: "Proofs in about 1 to 2 business days. You pick your finals from the proofs.",
  },
  {
    q: "What should people wear?",
    a: "Solid colors and a fitted jacket or blouse. Avoid busy patterns and big logos. Bring a second option if you're not sure.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/corporate-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/corporate-headshots`,
  },
};

export default function CorporateHeadshotsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Corporate and executive headshots",
            serviceType: "Headshot photography",
            description,
            url: `${site.url}/corporate-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Corporate headshots", path: "/corporate-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Corporate and executive headshots
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              When someone looks up your company, they look at the people. The leadership page, the
              &quot;Meet our team&quot; section, the bio under a press release. Those photos tell a
              client whether you&apos;re a serious, approachable firm before anyone picks up the
              phone. That&apos;s the headshot I shoot: professional, and still clearly a real person.
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
              Tell me how many people, where you are, and where the photos will be used.
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
                Executives and owners. Accountants and bookkeepers. Insurance agents and brokers.
                Financial advisors and people at finance firms. Office staff at companies that want
                a clean, current website. It works for one executive who needs a new photo for a
                speaking bio, or for a few people at once. If you&apos;re planning a day for the
                whole staff, see{" "}
                <Link href="/team-headshots" className="underline hover:text-brass-2">
                  team headshots
                </Link>
                .
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">
                Made for where the photo actually goes
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                A corporate headshot ends up in a lot of places: the leadership page, LinkedIn,
                press releases, proposals, conference and speaker bios, and email signatures. I
                frame with those uses in mind, so you get a tight crop that still reads at small
                sizes and a wider one that looks good on a website.
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                If your company already has a style, send me a link to your current team page and
                I&apos;ll match the background, light and framing, so a new hire fits right in next
                to everyone else.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">At your office or at my studio</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                For one or two people, the studio in Spring Valley is the simplest. For several
                people, I can come to your office. I set up quickly in a spare room or office and
                work around your schedule, so nobody loses much of their day.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Confident, not stiff</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Most corporate headshots look the same: a tight smile and a gray backdrop. I&apos;d
                rather you look confident and approachable, like yourself on a good day. I&apos;ll
                guide you through posture and expression, and we check the shots together on the
                laptop so you&apos;re not guessing.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Pricing and turnaround</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                On-site sessions are quoted, so tell me how many people and where.{" "}
                <Link href="/pricing" className="underline hover:text-brass-2">
                  See pricing
                </Link>{" "}
                for studio sessions. Proofs are ready in about 1 to 2 business days, and you choose
                your finals from there.
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
              Need new headshots for your leadership page or office?{" "}
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
