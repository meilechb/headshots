"use client";

import { useActionState, useRef } from "react";
import type { ActionState } from "@/lib/action-state";
import { Field } from "./form";

export type PackageOption = {
  id: string;
  name: string;
  price_cents: number;
  description: string | null;
};

/**
 * "Add a session" form. Picking a package fills in the title, price and
 * client-facing note; everything stays editable. Resets after a save.
 */
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
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  function applyPackage(id: string) {
    const p = packages.find((x) => x.id === id);
    if (!p) return;
    if (titleRef.current) titleRef.current.value = `${p.name} session`;
    if (amountRef.current) amountRef.current.value = String(p.price_cents / 100);
    if (descriptionRef.current) descriptionRef.current.value = p.description ?? "";
  }

  return (
    <form key={state.at ?? 0} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Package" htmlFor="session-package" hint="fills in the rest">
        <select
          id="session-package"
          name="package_id"
          defaultValue=""
          onChange={(e) => applyPackage(e.target.value)}
          className="input"
        >
          <option value="">Custom</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}, ${(p.price_cents / 100).toFixed(0)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Title" htmlFor="session-title">
        <input
          ref={titleRef}
          id="session-title"
          name="title"
          defaultValue="Headshot session"
          required
          className="input"
        />
      </Field>
      <Field label="Price" htmlFor="session-amount" hint="USD">
        <input
          ref={amountRef}
          id="session-amount"
          name="amount"
          inputMode="decimal"
          required
          placeholder="495"
          className="input"
        />
      </Field>
      <Field label="Shoot date" htmlFor="session-date" hint="optional">
        <input id="session-date" name="shoot_date" type="date" className="input" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Note to client" htmlFor="session-description" hint="shown on the payment page">
          <textarea
            ref={descriptionRef}
            id="session-description"
            name="description"
            rows={2}
            className="input"
            placeholder="60-minute studio session, 2 looks, 5 retouched images."
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Adding…" : "Add session"}
        </button>
        {state.error ? (
          <p role="alert" className="text-sm text-danger">{state.error}</p>
        ) : null}
      </div>
    </form>
  );
}
