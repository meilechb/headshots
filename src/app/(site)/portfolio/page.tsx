import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/site/portfolio-grid";
import { getPortfolio } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Headshot Portfolio, Rockland County, NY",
  description:
    "Recent headshots photographed in Rockland County, NY: business and LinkedIn headshots, team photos, actor headshots and personal brand portraits.",
  alternates: { canonical: "/portfolio" },
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
