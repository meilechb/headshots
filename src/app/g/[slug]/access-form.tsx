"use client";

import { useActionState } from "react";
import { unlockGallery, type UnlockState } from "./actions";

export function AccessForm({
  slug,
  title,
  clientName,
}: {
  slug: string;
  title: string;
  clientName: string;
}) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(
    unlockGallery,
    {}
  );

  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <form action={action} className="card w-full max-w-md p-8">
        <p className="eyebrow">For {clientName}</p>
        <h1 className="mt-3 font-display text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          Enter the access code from your email to view your photos.
        </p>
        <input type="hidden" name="slug" value={slug} />
        <label htmlFor="code" className="label mt-6">
          Access code
        </label>
        <input
          id="code"
          name="code"
          required
          autoComplete="one-time-code"
          autoCapitalize="characters"
          spellCheck={false}
          className="input font-mono text-lg tracking-[0.3em] uppercase"
          placeholder="ABC123"
        />
        {state.error ? (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="btn-primary mt-6 w-full">
          {pending ? "Checking…" : "View photos"}
        </button>
      </form>
    </section>
  );
}
