"use client";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="card max-w-md p-8 text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 font-display text-2xl">The gallery couldn’t load.</h1>
        <p className="mt-2 text-sm text-muted">
          {error.message || "Unknown error."}
          {error.digest ? ` (ref ${error.digest})` : ""}
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Try again
        </button>
      </div>
    </section>
  );
}
