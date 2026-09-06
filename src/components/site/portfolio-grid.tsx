"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { portfolioCategories } from "@/lib/site";

export type GridImage = {
  id: string;
  url: string;
  alt: string;
  category: string;
  width: number | null;
  height: number | null;
};

// Shown until real work is uploaded in /admin/portfolio.
const placeholders: GridImage[] = [
  { id: "p1", url: "", alt: "Sample corporate headshot", category: "corporate", width: 4, height: 5 },
  { id: "p2", url: "", alt: "Sample personal brand portrait", category: "personal-brand", width: 3, height: 4 },
  { id: "p3", url: "", alt: "Sample actor headshot", category: "actors", width: 4, height: 5 },
  { id: "p4", url: "", alt: "Sample team headshot", category: "teams", width: 1, height: 1 },
  { id: "p5", url: "", alt: "Sample creative portrait", category: "creative", width: 3, height: 4 },
  { id: "p6", url: "", alt: "Sample corporate headshot", category: "corporate", width: 4, height: 5 },
  { id: "p7", url: "", alt: "Sample personal brand portrait", category: "personal-brand", width: 1, height: 1 },
  { id: "p8", url: "", alt: "Sample actor headshot", category: "actors", width: 3, height: 4 },
  { id: "p9", url: "", alt: "Sample team headshot", category: "teams", width: 4, height: 5 },
];

const tones = [
  "from-[#d9cfbf] to-[#b9ab94]",
  "from-[#cfc7bb] to-[#8f877b]",
  "from-[#e2d6c3] to-[#a8875a]",
  "from-[#c9c2b8] to-[#6e675e]",
];

export function PortfolioGrid({
  images,
  showFilters = true,
  limit,
}: {
  images: GridImage[];
  showFilters?: boolean;
  limit?: number;
}) {
  const source = images.length ? images : placeholders;
  const usingPlaceholders = images.length === 0;
  const [category, setCategory] = useState<string>("all");
  const [active, setActive] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list =
      category === "all" ? source : source.filter((i) => i.category === category);
    return limit ? list.slice(0, limit) : list;
  }, [source, category, limit]);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) =>
        i === null ? null : (i + dir + filtered.length) % filtered.length
      ),
    [filtered.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

  return (
    <div>
      {showFilters ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {[{ slug: "all", label: "All" }, ...portfolioCategories].map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                category === c.slug
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-2 hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}

      {usingPlaceholders ? (
        <p className="mb-6 text-sm text-muted">
          Sample layout. Upload your work in the studio dashboard to replace
          these tiles.
        </p>
      ) : null}

      <div className="masonry">
        {filtered.map((img, i) => {
          const w = img.width ?? 4;
          const h = img.height ?? 5;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className="group relative block w-full overflow-hidden rounded-xl bg-paper-2 text-left"
              style={{ aspectRatio: `${w} / ${h}` }}
              aria-label={`Open ${img.alt || "photo"}`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tones[i % tones.length]}`}
                >
                  <div className="absolute inset-x-0 bottom-0 p-4 text-xs uppercase tracking-[0.18em] text-white/80">
                    {img.category.replace("-", " ")}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {active !== null && filtered[active] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
          >
            ›
          </button>
          <div
            className="relative h-[85vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {filtered[active].url ? (
              <Image
                src={filtered[active].url}
                alt={filtered[active].alt}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
              />
            ) : (
              <div className={`h-full w-full rounded-xl bg-gradient-to-br ${tones[active % tones.length]}`} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
