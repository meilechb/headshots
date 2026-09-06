"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "./actions";

export function ContactForm({
  packages,
  defaultPackage,
}: {
  packages: { slug: string; name: string }[];
  defaultPackage?: string;
}) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(
    submitInquiry,
    {}
  );

  const v = state.values;

  if (state.ok) {
    return (
      <div className="card p-8">
        <p className="eyebrow">Received</p>
        <h2 className="mt-3 font-display text-2xl">Thanks — I’ll be in touch.</h2>
        <p className="mt-2 text-sm text-muted">
          Expect a reply within one business day with available dates and a
          short prep guide.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input id="name" name="name" required className="input" autoComplete="name" defaultValue={v?.name ?? ""} />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" defaultValue={v?.email ?? ""} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="label">
            Phone <span className="text-muted">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" defaultValue={v?.phone ?? ""} />
        </div>
        <div>
          <label htmlFor="package" className="label">
            Interested in
          </label>
          <select
            id="package"
            name="package"
            defaultValue={v?.package ?? defaultPackage ?? ""}
            className="input"
          >
            <option value="">Not sure yet</option>
            {packages.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="label">
          What are the photos for?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="input"
          defaultValue={v?.message ?? ""}
          placeholder="LinkedIn, company website, a team of 12, an acting reel…"
        />
      </div>
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
