import type Stripe from "stripe";
import { markOrderPaid } from "@/lib/data/orders";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

/**
 * Stripe webhook. Register https://<domain>/api/stripe/webhook in the Stripe
 * Dashboard with these events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
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

  // Stripe may deliver the same event more than once; the primary key on
  // stripe_events.id makes processing idempotent.
  let inserted: Record<string, unknown>[];
  try {
    inserted = await db()`
      insert into stripe_events (id, type) values (${event.id}, ${event.type})
      on conflict (id) do nothing
      returning id`;
  } catch {
    return new Response("Could not record event", { status: 500 });
  }
  if (inserted.length === 0) {
    return Response.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      // Delayed payment methods complete later; only fulfill when paid.
      if (session.payment_status === "paid") {
        const orderId = session.metadata?.order_id ?? session.client_reference_id;
        if (orderId) {
          await markOrderPaid({
            orderId,
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
          });
        }
      }
      break;
    }
    case "checkout.session.async_payment_failed":
      // Order stays pending_payment; the client can retry from the pay link.
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
