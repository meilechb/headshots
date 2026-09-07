"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import type { ContractSection } from "@/lib/contract";
import { formatMoney } from "@/lib/types";
import { signContract, type SignState } from "./actions";

export type PayChoice = { kind: "deposit" | "full" | "balance"; label: string; amount_cents: number };

export function PayFlow({
  orderId,
  publishableKey,
  signed: signedAtLoad,
  needsContract,
  contract,
  choices,
  currency,
  email,
}: {
  orderId: string;
  publishableKey: string | null;
  signed: boolean;
  needsContract: boolean;
  contract: ContractSection[];
  choices: PayChoice[];
  currency: string;
  email: string;
}) {
  const [signState, signAction, signing] = useActionState<SignState, FormData>(
    signContract.bind(null, orderId),
    {}
  );
  const signed = signedAtLoad || Boolean(signState.ok);

  if (needsContract && !signed) {
    return (
      <form action={signAction} className="mt-6 space-y-4">
        <h2 className="font-medium">Agreement</h2>
        <div className="max-h-72 space-y-4 overflow-y-auto border border-line bg-paper p-4 text-sm text-ink-2">
          {contract.map((s) => (
            <section key={s.heading}>
              <h3 className="font-medium text-ink">{s.heading}</h3>
              {s.body.map((p, i) => (
                <p key={i} className="mt-1.5">{p}</p>
              ))}
            </section>
          ))}
        </div>
        <div>
          <label htmlFor="sign-name" className="label">Your full name</label>
          <input id="sign-name" name="name" required autoComplete="name" className="input" />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="agree" required className="mt-1 h-4 w-4" />
          I have read and agree to the terms above.
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="portfolio_ok" defaultChecked className="mt-1 h-4 w-4" />
          My photos may be shown in the portfolio.
        </label>
        {signState.error ? <p role="alert" className="text-sm text-danger">{signState.error}</p> : null}
        <button type="submit" disabled={signing} className="btn-primary w-full">
          {signing ? "Saving…" : "Agree and continue"}
        </button>
      </form>
    );
  }

  return <Payment orderId={orderId} publishableKey={publishableKey} choices={choices} currency={currency} email={email} />;
}

function Payment({
  orderId,
  publishableKey,
  choices,
  currency,
  email,
}: {
  orderId: string;
  publishableKey: string | null;
  choices: PayChoice[];
  currency: string;
  email: string;
}) {
  const [chosen, setChosen] = useState<PayChoice | null>(choices.length === 1 ? choices[0] : null);
  const [secret, setSecret] = useState<{ clientSecret: string; sessionId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  // Starts a Checkout Session for the chosen amount; state updates happen after the request resolves.
  useEffect(() => {
    if (!chosen || !publishableKey) return;
    let cancelled = false;
    fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId, kind: chosen.kind }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Could not start the payment.");
        if (!cancelled) setSecret({ clientSecret: data.clientSecret, sessionId: data.sessionId });
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [chosen, orderId, publishableKey]);

  function choose(c: PayChoice) {
    if (chosen?.kind === c.kind) return;
    setSecret(null);
    setError(null);
    setChosen(c);
  }

  if (!publishableKey) {
    return (
      <p className="mt-6 text-sm text-ink-2">
        Card payments are not set up yet. Email <a href={`mailto:${email}`} className="underline">{email}</a> to pay.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {choices.length > 1 ? (
        <div className="grid grid-cols-2 gap-2">
          {choices.map((c) => (
            <button
              key={c.kind}
              type="button"
              onClick={() => choose(c)}
              className={chosen?.kind === c.kind ? "btn-primary" : "btn-secondary"}
            >
              {c.label} {formatMoney(c.amount_cents, currency)}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {chosen && !secret && !error ? <p className="text-sm text-muted">Loading…</p> : null}
      {secret && chosen && stripePromise ? (
        <CheckoutElementsProvider
          key={secret.sessionId}
          stripe={stripePromise}
          options={{
            clientSecret: secret.clientSecret,
            elementsOptions: {
              appearance: appearanceFromPage(),
              fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" }],
            },
          }}
        >
          <PayForm sessionId={secret.sessionId} />
        </CheckoutElementsProvider>
      ) : null}
    </div>
  );
}

function PayForm({ sessionId }: { sessionId: string }) {
  const state = useCheckoutElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.type === "loading") return <p className="text-sm text-muted">Loading…</p>;
  if (state.type === "error") return <p role="alert" className="text-sm text-danger">{state.error.message}</p>;
  const { checkout } = state;

  async function pay() {
    setBusy(true);
    setError(null);
    const result = await checkout.confirm({ redirect: "if_required" });
    if (result.type === "error") {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    router.push(`/pay/success?session_id=${encodeURIComponent(sessionId)}`);
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <button type="button" onClick={pay} disabled={!checkout.canConfirm || busy} className="btn-primary w-full">
        {busy ? "Paying…" : `Pay ${checkout.total.total.amount}`}
      </button>
    </div>
  );
}

/** Reads the site's colour tokens so the card form matches the page. */
function appearanceFromPage(): Appearance {
  const css = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const token = (name: string, fallback: string) => {
    const v = css?.getPropertyValue(name).trim();
    return v && !v.startsWith("rgba") ? v : fallback;
  };
  const ink = token("--color-ink", "#fafafa");
  const line = css?.getPropertyValue("--color-line").trim() || "rgba(255, 255, 255, 0.14)";
  return {
    theme: "night",
    variables: {
      colorPrimary: ink,
      colorBackground: token("--color-paper", "#0d0d0e"),
      colorText: ink,
      colorTextSecondary: token("--color-ink-2", "#9a9a9a"),
      colorTextPlaceholder: token("--color-muted", "#6a6a6a"),
      colorDanger: token("--color-danger", "#f87171"),
      fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
      fontSizeBase: "16px",
      borderRadius: "0px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": { border: `1px solid ${line}`, boxShadow: "none" },
      ".Input:focus": { border: `1px solid ${ink}`, boxShadow: "none" },
      ".Tab": { border: `1px solid ${line}`, boxShadow: "none" },
      ".Tab--selected": { border: `1px solid ${ink}`, boxShadow: "none" },
      ".Block": { border: `1px solid ${line}`, boxShadow: "none" },
    },
  };
}
