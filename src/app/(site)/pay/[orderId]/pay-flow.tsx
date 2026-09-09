"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import type { StripeCheckoutConfirmResult, StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  ExpressCheckoutElement,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { ContractSection } from "@/lib/contract";
import { formatMoney } from "@/lib/types";
import { signContract, type SignState } from "./actions";
import { POSTAL_CODE_REQUIRED, countryOptions } from "./countries";

export type PayChoice = { kind: "deposit" | "full" | "balance"; label: string; amount_cents: number };

type Secret = { clientSecret: string; sessionId: string };

const AMOUNT_LABEL: Record<PayChoice["kind"], string> = {
  deposit: "Deposit",
  full: "Full amount",
  balance: "Remaining balance",
};

export function PayFlow({
  summary,
  orderId,
  publishableKey,
  signed: signedAtLoad,
  needsContract,
  contract,
  choices,
  currency,
  clientName,
  email,
}: {
  /** Order title, client and price breakdown, rendered by the page. */
  summary: ReactNode;
  orderId: string;
  publishableKey: string | null;
  signed: boolean;
  needsContract: boolean;
  contract: ContractSection[];
  choices: PayChoice[];
  currency: string;
  /** Goes on the card's billing details with the country and postal code. */
  clientName: string;
  email: string;
}) {
  const [signState, signAction, signing] = useActionState<SignState, FormData>(
    signContract.bind(null, orderId),
    {}
  );
  const signed = signedAtLoad || Boolean(signState.ok);

  if (needsContract && !signed) {
    return (
      <div className="card w-full max-w-lg p-8">
        {summary}
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
      </div>
    );
  }

  return (
    <Payment
      summary={summary}
      orderId={orderId}
      publishableKey={publishableKey}
      choices={choices}
      currency={currency}
      clientName={clientName}
      email={email}
    />
  );
}

function Payment({
  summary,
  orderId,
  publishableKey,
  choices,
  currency,
  clientName,
  email,
}: {
  summary: ReactNode;
  orderId: string;
  publishableKey: string | null;
  choices: PayChoice[];
  currency: string;
  clientName: string;
  email: string;
}) {
  const [chosen, setChosen] = useState<PayChoice | null>(choices.length === 1 ? choices[0] : null);
  // One Checkout Session per offered amount, requested together as soon as the
  // page opens so both forms are mounted and ready before the client picks.
  const [secrets, setSecrets] = useState<Partial<Record<PayChoice["kind"], Secret>>>({});
  const [errors, setErrors] = useState<Partial<Record<PayChoice["kind"], string>>>({});
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);
  const payColumn = useRef<HTMLDivElement>(null);
  const kinds = choices.map((c) => c.kind).join(",");

  useEffect(() => {
    if (!publishableKey) return;
    let cancelled = false;
    for (const kind of kinds.split(",") as PayChoice["kind"][]) {
      fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, kind }),
      })
        .then(async (r) => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error ?? "Could not start the payment.");
          if (!cancelled) setSecrets((s) => ({ ...s, [kind]: { clientSecret: data.clientSecret, sessionId: data.sessionId } }));
        })
        .catch((e: Error) => {
          if (!cancelled) setErrors((s) => ({ ...s, [kind]: e.message }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [kinds, orderId, publishableKey]);

  // On narrow screens the columns stack, so bring the payment form into view
  // when the client picks an amount. Desktop shows both columns side by side.
  useEffect(() => {
    if (!chosen || choices.length < 2) return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    payColumn.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chosen, choices.length]);

  function choose(c: PayChoice) {
    if (chosen?.kind === c.kind) return;
    setChosen(c);
  }

  const picker =
    choices.length > 1 ? (
      <div className="mt-6 grid grid-cols-2 gap-2">
        {choices.map((c) => (
          <button
            key={c.kind}
            type="button"
            onClick={() => choose(c)}
            aria-pressed={chosen?.kind === c.kind}
            className={chosen?.kind === c.kind ? "btn-primary" : "btn-secondary"}
          >
            {c.label} {formatMoney(c.amount_cents, currency)}
          </button>
        ))}
      </div>
    ) : null;

  if (!publishableKey) {
    return (
      <div className="card w-full max-w-lg p-8">
        {summary}
        <p className="mt-6 text-sm text-ink-2">
          Card payments are not set up yet. Email <a href={`mailto:${email}`} className="underline">{email}</a> to pay.
        </p>
      </div>
    );
  }

  // One tree for both states, so the Stripe forms keep their place in the DOM
  // and are never remounted. Before a choice, the page is one compact card and
  // the payment card sits beside it invisibly (visibility, not display: Stripe
  // asks that its elements stay laid out while they load) at roughly the width
  // it will have later, so the wallet buttons measure correctly. After a
  // choice, the payment card takes the wider column and only the chosen
  // amount's form is visible; the other stays mounted and invisible on top.
  const elementsOptions = {
    appearance: appearanceFromPage(),
    fonts: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" }],
  };
  return (
    <div
      className={
        chosen
          ? "grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start"
          : "relative w-full max-w-lg"
      }
    >
      <div className="card p-6 lg:p-8">
        {summary}
        {picker}
      </div>
      <div
        ref={payColumn}
        aria-hidden={!chosen}
        className={chosen ? "card scroll-mt-24 p-6" : "invisible absolute left-0 top-0 w-[36rem] max-w-full p-6"}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-medium">Payment</h2>
          {chosen ? (
            <p className="text-sm text-muted">
              {AMOUNT_LABEL[chosen.kind]} · {formatMoney(chosen.amount_cents, currency)}
            </p>
          ) : null}
        </div>
        <div className="relative mt-4">
          {choices.map((c) => {
            const active = chosen?.kind === c.kind;
            const secret = secrets[c.kind];
            const error = errors[c.kind];
            return (
              <div key={c.kind} aria-hidden={!active} className={active ? "" : "invisible absolute inset-x-0 top-0"}>
                {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
                {!secret && !error ? <p className="text-sm text-muted">Loading…</p> : null}
                {secret && stripePromise ? (
                  <CheckoutElementsProvider
                    key={secret.sessionId}
                    stripe={stripePromise}
                    options={{ clientSecret: secret.clientSecret, elementsOptions }}
                  >
                    <PayForm sessionId={secret.sessionId} clientName={clientName} />
                  </CheckoutElementsProvider>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PayForm({ sessionId, clientName }: { sessionId: string; clientName: string }) {
  const state = useCheckoutElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // null until Stripe reports which wallet buttons, if any, this device can show.
  const [walletAvailable, setWalletAvailable] = useState<boolean | null>(null);
  // Billing country and postal code are collected here, side by side, instead
  // of inside the Stripe form, which stacks them on separate rows.
  const [country, setCountry] = useState("US");
  const [postalCode, setPostalCode] = useState("");
  const countries = useMemo(() => countryOptions(typeof navigator === "undefined" ? "en" : navigator.language), []);
  const postalRequired = POSTAL_CODE_REQUIRED.has(country);
  const postalMissing = postalRequired && postalCode.trim() === "";

  if (state.type === "loading") return <p className="text-sm text-muted">Loading…</p>;
  if (state.type === "error") return <p role="alert" className="text-sm text-danger">{state.error.message}</p>;
  const { checkout } = state;

  function finish(result: StripeCheckoutConfirmResult) {
    if (result.type === "error") {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    router.push(`/pay/success?session_id=${encodeURIComponent(sessionId)}`);
  }

  // Card path. The Payment Element collects no address (fields.billingDetails
  // .address is "never"), so Stripe requires the omitted fields here.
  async function pay() {
    setBusy(true);
    setError(null);
    finish(
      await checkout.confirm({
        redirect: "if_required",
        billingAddress: {
          name: clientName,
          address: { country, postal_code: postalCode.trim() || null },
        },
      })
    );
  }

  // Apple Pay / Google Pay sheet approved. The wallet supplies its own billing
  // details, so nothing from the fields below is sent.
  async function payWithWallet(event: StripeExpressCheckoutElementConfirmEvent) {
    setBusy(true);
    setError(null);
    finish(await checkout.confirm({ expressCheckoutConfirmEvent: event, redirect: "if_required" }));
  }

  // Stripe asks that the Express Checkout Element stay in the layout (only
  // invisible) while it works out which buttons it can show. Once it reports,
  // the block is either shown with a divider or removed from the flow.
  const walletBlock = walletAvailable === null ? "invisible" : walletAvailable ? "mb-3" : "hidden";

  return (
    <div>
      {/*
        One-click wallets live in the Express Checkout Element. Apple Pay and
        Google Pay are set to "always" so they show wherever the browser and
        device can pay with them (Stripe's default "auto" also weighs its own
        conversion model, which can hide them). Stripe's own platform table
        decides where each button can exist: Apple Pay never renders in Chrome
        on Android, and does render in Chrome and Edge on Windows and macOS
        only because "always" is set. No user-agent checks here. Link, Klarna,
        Amazon Pay and PayPal are turned off by name so no wallet-borne option
        can appear. The two buttons share one row, Google Pay first; Stripe
        stacks them only when the column is too narrow for two.
      */}
      <div className={walletBlock}>
        <ExpressCheckoutElement
          options={{
            paymentMethods: {
              applePay: "always",
              googlePay: "always",
              link: "never",
              klarna: "never",
              amazonPay: "never",
              paypal: "never",
            },
            buttonHeight: 40,
            buttonTheme: { applePay: "white", googlePay: "white" },
            buttonType: { applePay: "plain", googlePay: "plain" },
            layout: { maxColumns: 2, maxRows: 1 },
            paymentMethodOrder: ["google_pay", "apple_pay"],
          }}
          onConfirm={payWithWallet}
          onReady={(event) => setWalletAvailable(Boolean(event.availablePaymentMethods))}
          onAvailablePaymentMethodsChange={(event) => setWalletAvailable(Boolean(event.paymentMethods))}
        />
        {walletAvailable ? (
          <p className="mt-3 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
            or pay by card
          </p>
        ) : null}
      </div>
      <div className="space-y-3">
        {/*
          Card number, expiry and security code only. Wallets are handled
          above, and Link is off both here and on the Checkout Session, so its
          Klarna and Bank rows cannot show. With a single payment method the
          tabs layout draws no tab strip. The billing address is collected by
          the two fields below and passed to confirm().
        */}
        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
            wallets: { applePay: "never", googlePay: "never", link: "never" },
            fields: { billingDetails: { address: "never" } },
          }}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="billing-country" className="mb-1 block text-[13px] text-ink-2">
              Country
            </label>
            <select
              id="billing-country"
              name="country"
              autoComplete="billing country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input h-10 py-0 text-sm"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="billing-postal" className="mb-1 block text-[13px] text-ink-2">
              {country === "US" ? "ZIP" : "Postal code"}
            </label>
            <input
              id="billing-postal"
              name="postal_code"
              inputMode={country === "US" ? "numeric" : "text"}
              autoComplete="billing postal-code"
              required={postalRequired}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="input h-10 py-0 text-sm"
            />
          </div>
        </div>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <button
          type="button"
          onClick={pay}
          disabled={!checkout.canConfirm || busy || postalMissing}
          className="btn-primary w-full"
        >
          {busy ? "Paying…" : `Pay ${checkout.total.total.amount}`}
        </button>
      </div>
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
      // Stripe asks for at least 16px in inputs so phones do not zoom on focus;
      // labels and helper text scale down from fontSizeSm.
      fontSizeBase: "16px",
      fontSizeSm: "13px",
      borderRadius: "0px",
      spacingUnit: "3px",
      spacingGridRow: "8px",
      spacingGridColumn: "10px",
    },
    rules: {
      // 40px tall at 16px text, matching the country and postal code fields.
      ".Input": { border: `1px solid ${line}`, boxShadow: "none", padding: "9px 10px" },
      ".Label": { marginBottom: "4px" },
      ".Input:focus": { border: `1px solid ${ink}`, boxShadow: "none" },
      ".Tab": { border: `1px solid ${line}`, boxShadow: "none" },
      ".Tab--selected": { border: `1px solid ${ink}`, boxShadow: "none" },
      ".Block": { border: `1px solid ${line}`, boxShadow: "none" },
    },
  };
}
