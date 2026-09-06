"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useSwipe } from "@/lib/use-swipe";

export type GridImage = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

// Shown until real work is uploaded in /admin/portfolio.
const placeholders: GridImage[] = [
  { id: "p1", url: "", alt: "Sample headshot", width: 4, height: 5 },
  { id: "p2", url: "", alt: "Sample headshot", width: 3, height: 4 },
  { id: "p3", url: "", alt: "Sample headshot", width: 4, height: 5 },
  { id: "p4", url: "", alt: "Sample headshot", width: 1, height: 1 },
  { id: "p5", url: "", alt: "Sample headshot", width: 3, height: 4 },
  { id: "p6", url: "", alt: "Sample headshot", width: 4, height: 5 },
  { id: "p7", url: "", alt: "Sample headshot", width: 1, height: 1 },
  { id: "p8", url: "", alt: "Sample headshot", width: 3, height: 4 },
  { id: "p9", url: "", alt: "Sample headshot", width: 4, height: 5 },
];

const tones = [
  "repeating-linear-gradient(135deg,#1c1c1e,#1c1c1e 12px,#161618 12px,#161618 24px)",
  "repeating-linear-gradient(135deg,#202022,#202022 12px,#18181a 12px,#18181a 24px)",
  "repeating-linear-gradient(135deg,#1a1a1c,#1a1a1c 12px,#141416 12px,#141416 24px)",
];

function Tile({
  img,
  index,
  onOpen,
}: {
  img: GridImage;
  index: number;
  onOpen: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const w = img.width ?? 4;
  const h = img.height ?? 5;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block w-full overflow-hidden bg-paper-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      style={{ aspectRatio: `${w} / ${h}` }}
      aria-label={`Open ${img.alt || "photo"}`}
    >
      {img.url ? (
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setLoaded(true)}
          className={`object-cover transition duration-700 ease-out group-hover:scale-[1.03] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div
          className="absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.03]"
          style={{ background: tones[index % tones.length] }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-paper-4/0 transition duration-500 group-hover:bg-paper-4/20" />
    </button>
  );
}

export function PortfolioGrid({
  images,
  limit,
}: {
  images: GridImage[];
  limit?: number;
}) {
  const source = images.length ? images : placeholders;
  const usingPlaceholders = images.length === 0;
  const list = limit ? source.slice(0, limit) : source;
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) =>
        i === null ? null : (i + dir + list.length) % list.length
      ),
    [list.length]
  );
  const swipe = useSwipe(step);

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
      {usingPlaceholders ? (
        <p className="mb-6 text-sm text-muted">
          Sample layout. Upload your work in the studio dashboard to replace
          these tiles.
        </p>
      ) : null}

      <div className="masonry">
        {list.map((img, i) => (
          <Tile key={img.id} img={img} index={i} onOpen={() => setActive(i)} />
        ))}
      </div>

      {active !== null && list[active] ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex h-[100dvh] items-center justify-center bg-[#050505]/95 p-3 sm:p-4"
          onClick={close}
          {...swipe}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:left-4"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20 sm:right-4"
          >
            ›
          </button>
          <div
            className="relative h-[80dvh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {list[active].url ? (
              <Image
                src={list[active].url}
                alt={list[active].alt}
                fill
                sizes="100vw"
                quality={90}
                className="object-contain"
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: tones[active % tones.length] }}
              />
            )}
          </div>
          <p className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.14em] text-white/60">
            {active + 1} / {list.length}
          </p>
        </div>
      ) : null}
    </div>
  );
}
