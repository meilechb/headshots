import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { getPortfolio } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected headshots: corporate, personal brand, actors, teams and creative portraits.",
};

export default async function PortfolioPage() {
  const images = await getPortfolio();

  return (
    <section className="container-x py-14 md:py-20">
      <p className="eyebrow">Portfolio</p>
      <h1 className="mt-3 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
        Faces, not templates.
      </h1>
      <p className="mt-4 max-w-xl text-ink-2">
        Every session is lit and directed for the person in front of the
        camera. Browse by the kind of headshot you need.
      </p>
      <div className="mt-10">
        <PortfolioGrid
          images={images.map((f) => ({
            id: f.id,
            url: f.url,
            alt: f.alt,
            category: f.category,
            width: f.width,
            height: f.height,
          }))}
        />
      </div>
    </section>
  );
}
