import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/app/(site)/contact/contact-form";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

const title = "Law Firm and Attorney Headshots | Meilech Biller";
const description =
  "Attorney headshots for firm bio pages, lawyer directories and bar profiles. I come to your firm or you visit my studio. Proofs in about 1 to 2 business days.";

const faqs = [
  {
    q: "How much do attorney headshots cost?",
    a: "On-site sessions at your firm are quoted based on how many attorneys and where you are. See the pricing page for studio sessions.",
  },
  {
    q: "Can you match our firm's existing attorney photos?",
    a: "Yes. Send me a link to your attorneys page and I'll match the background, lighting and framing so new photos fit with the old ones.",
  },
  {
    q: "Will the photo work for lawyer directories and bar profiles?",
    a: "Tell me where you'll use it and I'll deliver crops for the firm website and the directories you use.",
  },
  {
    q: "How fast do we get the photos?",
    a: "Proofs in about 1 to 2 business days. You pick your finals from there.",
  },
];

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/law-firm-headshots" },
  openGraph: {
    title,
    description,
    url: `${site.url}/law-firm-headshots`,
  },
};

export default function LawFirmHeadshotsPage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Law firm and attorney headshots",
            serviceType: "Headshot photography",
            description,
            url: `${site.url}/law-firm-headshots`,
            provider: { "@id": `${site.url}/#business` },
            areaServed: { "@type": "AdministrativeArea", name: "Rockland County, NY" },
          },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Law firm headshots", path: "/law-firm-headshots" },
          ]),
        ]}
      />
      <article>
        <section className="container-x grid grid-cols-1 gap-10 pb-12 pt-12 md:grid-cols-[1.1fr_0.9fr] md:pb-16 md:pt-20">
          <div>
            <h1 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Attorney and law firm headshots
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              Clients often pick a lawyer from a bio page. They read the practice areas, then look
              at the photo and decide whether you seem like someone they can trust with their
              problem. I shoot attorney headshots that look sharp and serious, without looking stiff
              or cold.
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
              Tell me how many attorneys, where the firm is, and whether you have an existing look
              to match.
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
                Partners, associates, of counsel and paralegals. Solo attorneys who need one new
                photo, and firms that want every attorney bio to match.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">
                Made for bio pages and lawyer directories
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Your photo shows up on the firm&apos;s attorney page, on lawyer directories and bar
                profiles, on LinkedIn and next to articles or speaking bios. I deliver the crops the firm website and attorney
                directories need, so the same photo works everywhere.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">One look for the whole firm</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Partner pages look best when everyone matches. When I come to your office, partners
                and associates are photographed on the same day against the same background, with
                the same light and framing. When a new associate joins, I can match that look so the
                attorneys page stays consistent. If your firm already has a style, send me a link
                and I&apos;ll match it.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">At your firm or at my studio</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                I set up quickly in a spare room or office and work around your schedule, so people
                can step out between calls and meetings. For one person, the studio in Spring Valley
                is the simplest.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Serious, still approachable</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                Most attorney photos are a tight smile and crossed arms. I&apos;d rather you look
                confident and approachable, like someone a client would want to call. I guide
                posture and expression, and we check the shots together on the laptop as we go.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight">Pricing and turnaround</h2>
              <p className="mt-3 text-sm leading-7 text-ink-2">
                On-site sessions at your firm are quoted by headcount and location.{" "}
                <Link href="/pricing" className="underline hover:text-brass-2">
                  See pricing
                </Link>{" "}
                for studio sessions. Proofs are ready in about 1 to 2 business days. Photographing the whole office in one day? See{" "}
                <Link href="/team-headshots" className="underline hover:text-brass-2">
                  team headshots
                </Link>
                . Need just a LinkedIn photo? See{" "}
                <Link href="/linkedin-headshots" className="underline hover:text-brass-2">
                  LinkedIn headshots
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
              Updating your attorneys page?{" "}
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
