"use client";

import Image from "next/image";
import { useSwipe } from "@/lib/use-swipe";
import { useCallback, useEffect, useState, useTransition } from "react";
import { zipSync } from "fflate";
import { addClientComment, lockGallery, toggleSelection } from "./actions";

export type ViewPhoto = {
  id: string;
  filename: string;
  url: string;
  downloadUrl: string | null;
  width: number | null;
  height: number | null;
  selected: boolean;
  comments: {
    id: string;
    author_name: string;
    author_role: "admin" | "client";
    body: string;
    created_at: string;
  }[];
};

export function GalleryView({
  slug,
  title,
  kind,
  clientName,
  welcome,
  allowDownloads,
  expiresAt,
  photos,
}: {
  slug: string;
  title: string;
  kind: "proof" | "final";
  clientName: string;
  welcome: string | null;
  allowDownloads: boolean;
  expiresAt: string | null;
  photos: ViewPhoto[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [zipping, setZipping] = useState<null | { done: number; total: number }>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  const visible = onlyFavorites ? photos.filter((p) => p.selected) : photos;
  const favoriteCount = photos.filter((p) => p.selected).length;

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((i) => (i === null ? null : (i + dir + visible.length) % visible.length)),
    [visible.length]
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

  async function downloadAll() {
    const targets = photos.filter((p) => p.downloadUrl);
    if (!targets.length) return;
    setZipError(null);
    setZipping({ done: 0, total: targets.length });
    try {
      const files: Record<string, Uint8Array> = {};
      let done = 0;
      for (const p of targets) {
        const res = await fetch(p.downloadUrl!);
        if (!res.ok) throw new Error(`Failed to fetch ${p.filename}`);
        files[p.filename] = new Uint8Array(await res.arrayBuffer());
        done += 1;
        setZipping({ done, total: targets.length });
      }
      // JPEGs are already compressed; level 0 keeps this fast.
      const zipped = zipSync(files, { level: 0 });
      const blob = new Blob([zipped], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      setZipError(
        "Couldn’t build the zip in your browser. Use the download button on each photo instead."
      );
    } finally {
      setZipping(null);
    }
  }

  return (
    <section className="container-x py-10 md:py-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">
            {kind === "proof" ? "Proofs for review" : "Final delivery"} · {clientName}
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight">{title}</h1>
          {welcome ? (
            <p className="mt-3 max-w-xl whitespace-pre-line text-ink-2">{welcome}</p>
          ) : kind === "proof" ? (
            <p className="mt-3 max-w-xl text-ink-2">
              Tap a photo to view it large. Mark your favorites and leave a note
              on any frame you’d like retouched or adjusted.
            </p>
          ) : (
            <p className="mt-3 max-w-xl text-ink-2">
              Your retouched files are ready. Download individually or all at
              once.
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            {photos.length} photo{photos.length === 1 ? "" : "s"}
            {favoriteCount ? ` · ${favoriteCount} favorite${favoriteCount === 1 ? "" : "s"}` : ""}
            {expiresAt
              ? ` · Available until ${new Date(expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {favoriteCount > 0 ? (
            <button
              type="button"
              onClick={() => setOnlyFavorites((v) => !v)}
              className={onlyFavorites ? "btn-primary px-4 py-2" : "btn-secondary px-4 py-2"}
            >
              ♥ Favorites {onlyFavorites ? "(showing)" : ""}
            </button>
          ) : null}
          {allowDownloads && photos.some((p) => p.downloadUrl) ? (
            <button
              type="button"
              onClick={downloadAll}
              disabled={zipping !== null}
              className="btn-primary px-4 py-2"
            >
              {zipping ? `Preparing ${zipping.done}/${zipping.total}…` : "Download all"}
            </button>
          ) : null}
          <form action={() => lockGallery(slug)}>
            <button type="submit" className="btn-ghost min-h-10">
              Lock gallery
            </button>
          </form>
        </div>
      </div>
      {zipError ? (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {zipError}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-16 text-center text-muted">
          {onlyFavorites ? "No favorites yet." : "Photos are on their way."}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              className="group relative aspect-[4/5] overflow-hidden bg-paper-2 text-left"
              aria-label={`Open ${p.filename}`}
            >
              <Image
                src={p.url}
                alt={p.filename}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition duration-300 group-hover:opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2 text-[11px] text-white">
                <span className="truncate">{p.filename}</span>
                <span className="flex items-center gap-1.5">
                  {p.comments.length ? <span title="Notes">💬 {p.comments.length}</span> : null}
                  {p.selected ? <span title="Favorite">♥</span> : null}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {active !== null && visible[active] ? (
        <Lightbox
          slug={slug}
          kind={kind}
          photo={visible[active]}
          index={active}
          total={visible.length}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </section>
  );
}

function Lightbox({
  slug,
  kind,
  photo,
  index,
  total,
  onClose,
  onStep,
}: {
  slug: string;
  kind: "proof" | "final";
  photo: ViewPhoto;
  index: number;
  total: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const swipe = useSwipe(onStep);

  function submitNote() {
    setError(null);
    startTransition(async () => {
      const res = await addClientComment(slug, photo.id, note);
      if (res.error) setError(res.error);
      else setNote("");
    });
  }

  function toggleFavorite() {
    setError(null);
    startTransition(async () => {
      const res = await toggleSelection(slug, photo.id, !photo.selected);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.filename}
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-[#050505]/95 text-ink md:flex-row"
    >
      <div className="relative min-h-0 flex-1" onClick={onClose} {...swipe}>
        <div
          className="absolute inset-4 md:inset-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={photo.url}
            alt={photo.filename}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-contain"
          />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onStep(-1); }}
          aria-label="Previous"
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onStep(1); }}
          aria-label="Next"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl hover:bg-white/20"
        >
          ›
        </button>
        <span className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] text-xs text-white/60">
          {index + 1} / {total}
        </span>
      </div>

      <aside className="flex max-h-[50dvh] w-full flex-col border-t border-white/10 bg-paper-2 pb-[env(safe-area-inset-bottom)] md:max-h-none md:w-[360px] md:border-l md:border-t-0 md:pb-0">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
          <p className="truncate text-sm font-medium">{photo.filename}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 p-4">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={pending}
            className={`min-h-11 flex-1 border px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition ${
              photo.selected
                ? "border-[oklch(0.65_0.16_20)] bg-[oklch(0.65_0.16_20)] text-white"
                : "border-white/30 bg-transparent hover:bg-white/10"
            }`}
          >
            {photo.selected ? "♥ Favorite" : "♡ Mark favorite"}
          </button>
          {photo.downloadUrl ? (
            <a
              href={photo.downloadUrl}
              download={photo.filename}
              className="inline-flex min-h-11 items-center border border-white/30 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:opacity-85"
            >
              Download
            </a>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">
            Notes
          </p>
          {photo.comments.length === 0 ? (
            <p className="mt-2 text-sm text-white/60">
              {kind === "proof"
                ? "No notes yet. Ask for a retouch, a different crop, or just say this is the one."
                : "No notes on this photo."}
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {photo.comments.map((c) => (
                <li key={c.id} className="border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="flex items-center justify-between text-xs text-white/50">
                    <span>
                      {c.author_role === "admin" ? "Photographer" : c.author_name}
                    </span>
                    <span>
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                  <p className="mt-1 whitespace-pre-line">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Leave a note on this photo…"
            className="w-full border border-white/15 bg-white/5 px-3 py-2 text-base md:text-sm placeholder:text-white/40 focus:border-white/40 focus:outline-none"
          />
          {error ? (
            <p role="alert" className="mt-2 text-xs text-red-300">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={submitNote}
            disabled={pending || !note.trim()}
            className="mt-2 min-h-11 w-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-paper hover:opacity-85 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Send note"}
          </button>
        </div>
      </aside>
    </div>
  );
}
