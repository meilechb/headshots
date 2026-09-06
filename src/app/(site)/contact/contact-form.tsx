"use client";

import { useActionState, useState } from "react";
import { locationPrefs, sessionTypes } from "@/lib/types";
import { submitInquiry, type InquiryState } from "./actions";

export function ContactForm({
  packages,
  defaultPackage,
  email,
  defaultTown = "",
  defaultLocation = "",
  compact = false,
}: {
  packages: { slug: string; name: string }[];
  defaultPackage?: string;
  email: string;
  defaultTown?: string;
  defaultLocation?: string;
  /** Landing pages: no card chrome, fewer optional fields. */
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, {});
  const v = state.values;
  const [sessionType, setSessionType] = useState(v?.session_type ?? "");
  const showPeople = sessionType === "team" || sessionType === "medical";

  if (state.ok) {
    return (
      <div className={compact ? "" : "card p-6 sm:p-8"}>
        <h2 className="font-display text-2xl">Message received</h2>
        <p className="mt-3 text-ink-2">
          {state.emailed
            ? "A copy has been sent to your email."
            : "Thanks. Your message is in."}{" "}
          I reply within one business day.
        </p>
        <ol className="mt-6 space-y-3 text-sm leading-6 text-ink-2">
          <li className="flex gap-3"><span className="font-medium text-ink">1.</span> I email you available dates and confirm the package.</li>
          <li className="flex gap-3"><span className="font-medium text-ink">2.</span> You pick a date and pay online to hold it.</li>
          <li className="flex gap-3"><span className="font-medium text-ink">3.</span> You get a short note on what to wear and where to go.</li>
        </ol>
        <p className="mt-6 text-sm text-muted">
          Need to add something? Email <a href={`mailto:${email}`} className="underline">{email}</a>.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={compact ? "space-y-4" : "card space-y-5 p-6 sm:p-8"}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">Name</label>
          <input id="name" name="name" required className="input" autoComplete="name" defaultValue={v?.name ?? ""} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" inputMode="email" defaultValue={v?.email ?? ""} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">Phone <span className="text-muted">(optional)</span></label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" inputMode="tel" defaultValue={v?.phone ?? ""} />
        </div>
        <div>
          <label htmlFor="session_type" className="label">What do you need?</label>
          <select
            id="session_type"
            name="session_type"
            required
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="input"
          >
            <option value="" disabled>Choose one</option>
            {sessionTypes.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {showPeople ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="people_count" className="label">How many people?</label>
            <input id="people_count" name="people_count" type="number" min={1} max={5000} inputMode="numeric" className="input" defaultValue={v?.people_count ?? ""} placeholder="e.g. 12" />
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="location_pref" className="label">Where?</label>
          <select id="location_pref" name="location_pref" className="input" defaultValue={v?.location_pref ?? (showPeople ? "on-site" : defaultLocation)}>
            <option value="">Not sure yet</option>
            {locationPrefs.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="town" className="label">Your town <span className="text-muted">(optional)</span></label>
          <input id="town" name="town" className="input" autoComplete="address-level2" defaultValue={v?.town ?? defaultTown} placeholder="Monsey, Nanuet, New City…" />
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${compact ? "hidden" : ""}`}>
        <div>
          <label htmlFor="package" className="label">Package <span className="text-muted">(optional)</span></label>
          <select id="package" name="package" defaultValue={v?.package ?? defaultPackage ?? ""} className="input">
            <option value="">Not sure yet</option>
            {packages.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="timing" className="label">When? <span className="text-muted">(optional)</span></label>
          <input id="timing" name="timing" className="input" defaultValue={v?.timing ?? ""} placeholder="Next two weeks, weekday mornings…" />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label">Anything else? <span className="text-muted">(optional)</span></label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="input"
          defaultValue={v?.message ?? ""}
          placeholder="What the photos are for, a deadline, a photo you want to match…"
        />
      </div>

      <div className={compact ? "hidden" : ""}>
        <label htmlFor="source" className="label">How did you hear about me? <span className="text-muted">(optional)</span></label>
        <input id="source" name="source" className="input" defaultValue={v?.source ?? ""} placeholder="Google, a friend, Instagram…" />
      </div>

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
      <p className="text-xs text-muted">No account needed. I reply by email within one business day.</p>
    </form>
  );
}
