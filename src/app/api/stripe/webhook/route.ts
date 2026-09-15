import type Stripe from "stripe";
import { gaVisitorFromMetadata } from "@/lib/analytics-server";
import { cancelPendingPayment, recordPaidCheckoutSession } from "@/lib/data/orders";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook. Register https://<domain>/api/stripe/webhook in the Stripe
 * Dashboard with these events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   checkout.session.expired
 * Local testing: stripe listen --forward-to localhost:3000/api/stripe/webhook
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });
  }

  // Signature verification needs the raw, unmodified body.
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe-Signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Stripe may deliver the same event more than once. The row in stripe_events
  // claims the event; processed_at is set only after its work succeeded, so a
  // delivery that fails part way leaves the claim open and the retry runs the
  // event again instead of being dropped as a duplicate. Two deliveries racing
  // on the same unprocessed event may both run it; recordPaidCheckoutSession
  // moves a payment from pending to paid exactly once, so that is harmless.
  let claimed: Record<string, unknown>[];
  try {
    claimed = await db()`
      insert into stripe_events (id, type) values (${event.id}, ${event.type})
      on conflict (id) do update set type = excluded.type
      where stripe_events.processed_at is null
      returning id`;
  } catch {
    return new Response("Could not record event", { status: 500 });
  }
  if (claimed.length === 0) {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        // Delayed payment methods complete later; only record once paid.
        if (session.payment_status === "paid") {
          await recordPaidCheckoutSession({
            sessionId: session.id,
            amountTotal: session.amount_total,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
            visitor: gaVisitorFromMetadata(session.metadata),
          });
        }
        break;
      }
      case "checkout.session.expired":
        // Stripe closed the session (24 hours unpaid, or expired by the checkout
        // route). Nothing can be paid through it, so its row stops being pending.
        await cancelPendingPayment(event.data.object.id);
        break;
      case "checkout.session.async_payment_failed":
        // The payment row stays pending; the client can pay again from the link.
        break;
      default:
        break;
    }
    await db()`update stripe_events set processed_at = now() where id = ${event.id}`;
  } catch {
    // A 500 makes Stripe retry, and the open claim above lets that retry run.
    return new Response("Could not process event", { status: 500 });
  }

  return Response.json({ received: true });
}
