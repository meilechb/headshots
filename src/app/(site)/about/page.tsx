import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedPortfolio } from "@/lib/data/public";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Meilech Biller, Rockland County Headshot Photographer",
  description: `About ${site.name}, headshot photographer based in ${site.address.locality}, NY. How sessions work, where they happen, and how photos are retouched and delivered.`,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [portrait] = await getFeaturedPortfolio(1);

  return (
    <section className="container-x grid grid-cols-1 gap-12 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-20">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-3">
        {portrait ? (
          <Image
            src={portrait.url}
            alt={portrait.alt || `Headshot by ${site.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end bg-[repeating-linear-gradient(135deg,#1c1c1e,#1c1c1e_12px,#161618_12px,#161618_24px)] p-3.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">portrait</span>
          </div>
        )}
      </div>
      <div>
        <h1 className="font-display text-4xl tracking-tight sm:text-5xl">About {site.name}</h1>
        <div className="mt-6 space-y-5 leading-7 text-ink-2">
          <p>
            I am a headshot photographer based in {site.address.locality}, in
            Rockland County, NY. I photograph business owners, professionals,
            teams and actors, in my studio or at their office.
          </p>
          <p>
            A session is short and calm. I tell you where to stand, how to hold
            your shoulders and chin, and when the expression is right. Most
            people are surprised how quickly it goes. You do not need to know
            how to pose.
          </p>
          <p>
            Retouching is kept natural: skin is cleaned up, stray hairs and
            blemishes are removed, and the photo still looks like you. I do
            not reshape faces or bodies.
          </p>
          <p>
            Proofs are delivered to a private online gallery within a day or
            two. You mark your favorites and leave notes on any frame. The
            retouched files come to the same gallery, sized for the web and
            for print.
          </p>
          <p>
            Sessions are available on weekdays, weekday evenings and Sundays.
            The studio is closed Friday afternoon and Saturday. On-location
            sessions cover all of{" "}
            <Link href="/headshots/rockland-county" className="underline hover:text-brass-2">
              Rockland County
            </Link>
            .
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">Book a session</Link>
          <Link href="/portfolio" className="btn-secondary">See photos</Link>
        </div>
      </div>
    </section>
  );
}
