"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "./actions";

export function ContactForm({
  email,
  defaultTown = "",
  defaultLocation = "",
  compact = false,
}: {
  email: string;
  /** Set by the local landing pages so the message records where it came from. */
  defaultTown?: string;
  defaultLocation?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, {});
  const v = state.values;

  if (state.ok) {
    return (
      <div className={compact ? "" : "card p-6 sm:p-8"}>
        <h2 className="font-display text-2xl">Thanks</h2>
        <p className="mt-3 text-ink-2">I reply within one business day.</p>
      </div>
    );
  }

  return (
    <form action={action} className={compact ? "space-y-4" : "card space-y-5 p-6 sm:p-8"}>
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input id="name" name="name" required className="input" autoComplete="name" defaultValue={v?.name ?? ""} />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" inputMode="email" defaultValue={v?.email ?? ""} />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone</label>
        <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" inputMode="tel" defaultValue={v?.phone ?? ""} />
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={5} className="input" defaultValue={v?.message ?? ""} />
      </div>

      {defaultTown ? <input type="hidden" name="town" value={defaultTown} /> : null}
      {defaultLocation ? <input type="hidden" name="location_pref" value={defaultLocation} /> : null}
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-400">{state.error}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
        {pending ? "Sending…" : "Send"}
      </button>
      {!compact ? (
        <p className="text-xs text-muted">
          Or email <a href={`mailto:${email}`} className="underline">{email}</a>.
        </p>
      ) : null}
    </form>
  );
}
