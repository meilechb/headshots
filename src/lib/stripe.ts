import "server-only";

import Stripe from "stripe";

let client: Stripe | null = null;

/** Lazily constructed so builds without STRIPE_SECRET_KEY still succeed. */
export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
    client = new Stripe(key);
  }
  return client;
}

const registeredDomains = new Map<string, Promise<void>>();

/**
 * Apple Pay and Google Pay only appear in the Payment Element on domains that
 * are registered with Stripe (Dashboard → Settings → Payment method domains).
 * This registers the host the pay page is served from, once per server
 * instance, so nobody has to remember the Dashboard step. Stripe asks that a
 * domain be registered only once per account, hence the lookup first. A
 * failure here is logged and never blocks the payment itself.
 */
export function ensurePaymentMethodDomain(hostname: string): Promise<void> {
  const local = !hostname || hostname === "localhost" || /^[\d.]+$/.test(hostname) || hostname.includes(":");
  if (local) return Promise.resolve();
  let pending = registeredDomains.get(hostname);
  if (!pending) {
    pending = (async () => {
      const stripe = getStripe();
      const existing = await stripe.paymentMethodDomains.list({ domain_name: hostname, limit: 1 });
      if (existing.data.length === 0) {
        await stripe.paymentMethodDomains.create({ domain_name: hostname });
      }
    })().catch((error: unknown) => {
      console.error(`Could not register ${hostname} as a Stripe payment method domain`, error);
      registeredDomains.delete(hostname);
    });
    registeredDomains.set(hostname, pending);
  }
  return pending;
}
