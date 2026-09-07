"use client";

import { useActionState, useRef } from "react";
import type { ActionState } from "@/lib/action-state";

export type PackageOption = {
  id: string;
  name: string;
  price_cents: number;
  description: string | null;
};

/** One-row "Add session" form. Picking a package fills in the price and title. */
export function SessionForm({
  action,
  packages,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  packages: PackageOption[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const titleRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  function applyPackage(id: string) {
    const p = packages.find((x) => x.id === id);
    if (!p) return;
    if (titleRef.current) titleRef.current.value = p.name;
    if (amountRef.current && p.price_cents > 0) amountRef.current.value = String(p.price_cents / 100);
    if (descriptionRef.current) descriptionRef.current.value = p.description ?? "";
  }

  return (
    <form key={state.at ?? 0} action={formAction} className="flex flex-wrap items-center gap-2">
      <select
        name="package_id"
        defaultValue=""
        aria-label="Package"
        onChange={(e) => applyPackage(e.target.value)}
        className="input w-auto"
      >
        <option value="">Package…</option>
        {packages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}{p.price_cents > 0 ? `, $${(p.price_cents / 100).toFixed(0)}` : ""}
          </option>
        ))}
      </select>
      <input ref={titleRef} name="title" defaultValue="Headshot session" required aria-label="Title" className="input w-auto" />
      <input
        ref={amountRef}
        name="amount"
        inputMode="decimal"
        required
        placeholder="Price"
        aria-label="Price"
        className="input w-28"
      />
      <input name="shoot_date" type="date" aria-label="Shoot date" className="input w-auto" />
      <input ref={descriptionRef} type="hidden" name="description" />
      <button type="submit" disabled={pending} className="btn-primary px-3 py-2 text-xs">
        {pending ? "Adding…" : "Add session"}
      </button>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
