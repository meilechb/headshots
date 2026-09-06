import "server-only";
import { sendEmail } from "@/lib/email";
import { paymentReceiptEmail } from "@/lib/emails";
import { formatMoney } from "@/lib/types";

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
  const updated = one<{ order_number: number; title: string; amount_cents: number; currency: string; shoot_date: string | null; client_id: string }>(
    await db()`
      update orders
      set status = 'paid',
          paid_at = now(),
          stripe_checkout_session_id = ${input.sessionId},
          stripe_payment_intent_id = ${input.paymentIntentId},
          updated_at = now()
      where id = ${input.orderId}
        and status in ('draft', 'pending_payment')
      returning order_number, title, amount_cents, currency, shoot_date, client_id`
  );
  if (!updated) return; // already paid: no second receipt

  // Receipt is best effort; payment is recorded regardless.
  const client = one<{ name: string; email: string }>(
    await db()`select name, email from clients where id = ${updated.client_id} limit 1`
  );
  if (client) {
    const mail = paymentReceiptEmail({
      clientName: client.name,
      orderNumber: updated.order_number,
      title: updated.title,
      amount: formatMoney(updated.amount_cents, updated.currency),
      shootDate: updated.shoot_date,
    });
    await sendEmail({ to: client.email, subject: mail.subject, text: mail.text });
  }
}
