"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card max-w-lg p-8">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-2xl">That action didn’t complete.</h1>
      <p className="mt-2 text-sm text-muted">
        {error.message || "Unknown error."}
      </p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
