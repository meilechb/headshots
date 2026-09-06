import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedPortfolio } from "@/lib/data/public";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}, headshot photographer in ${site.location}.`,
};

export default async function AboutPage() {
  const [portrait] = await getFeaturedPortfolio(1);

  return (
    <section className="container-x grid gap-12 py-14 md:grid-cols-[0.9fr_1.1fr] md:py-20">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2 shadow-soft">
        {portrait ? (
          <Image
            src={portrait.url}
            alt={portrait.alt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#cfc7bb] to-[#8f877b]" />
        )}
      </div>
      <div>
        <p className="eyebrow">About</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          I photograph people who need to be trusted at a glance.
        </h1>
        <div className="mt-6 space-y-5 text-ink-2 leading-7">
          <p>
            A headshot has one job: make the right first impression before you
            say a word. I keep sessions calm and unhurried, direct you through
            posture and expression, and light for how you actually look in a
            meeting, not a magazine.
          </p>
          <p>
            I work with executives, founders, attorneys, physicians, actors and
            entire teams, in the studio or on location at your office in{" "}
            {site.location}. Retouching is careful and natural; the goal is you
            on a great day, not someone else.
          </p>
          <p>
            Proofs are delivered within days to a private online gallery where
            you can leave notes on individual frames and pick favorites. Finals
            arrive in the same place, ready to download in web and print sizes.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/contact" className="btn-primary">
            Book a session
          </Link>
          <Link href="/portfolio" className="btn-secondary">
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
