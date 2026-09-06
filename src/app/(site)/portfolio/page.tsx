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
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">
        Portfolio
      </h1>
      <div className="mt-10">
        <PortfolioGrid
          images={images.map((f) => ({
            id: f.id,
            url: f.url,
            alt: f.alt,
            width: f.width,
            height: f.height,
          }))}
        />
      </div>
    </section>
  );
}
