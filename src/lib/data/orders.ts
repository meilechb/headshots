import "server-only";

import { db, one, UUID_RE } from "@/lib/db";
import type { Client, Order } from "@/lib/types";

export type PayableOrder = Order & { client: Pick<Client, "name" | "email"> };

/** Public pay page lookup. Order ids are unguessable UUIDs shared by link. */
export async function getOrderForPayment(orderId: string): Promise<PayableOrder | null> {
  if (!UUID_RE.test(orderId)) return null;
  const result = await db()`
    select o.*, json_build_object('name', c.name, 'email', c.email) as client
    from orders o
    join clients c on c.id = o.client_id
    where o.id = ${orderId}
    limit 1`;
  return one<PayableOrder>(result);
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  await db()`
    update orders
    set stripe_checkout_session_id = ${sessionId}, updated_at = now()
    where id = ${orderId}`;
}

/** Idempotent: a paid order stays paid. Called from the webhook and the success page. */
export async function markOrderPaid(input: {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  if (!UUID_RE.test(input.orderId)) return;
  await db()`
    update orders
    set status = 'paid',
        paid_at = now(),
        stripe_checkout_session_id = ${input.sessionId},
        stripe_payment_intent_id = ${input.paymentIntentId},
        updated_at = now()
    where id = ${input.orderId}
      and status in ('draft', 'pending_payment')`;
}
