import "server-only";
import { GA_EVENTS } from "@/lib/analytics";
import { sendServerEvent, type GaVisitor } from "@/lib/analytics-server";
import { sendEmail } from "@/lib/email";
import { paymentReceiptEmail } from "@/lib/emails";
import { db, one, rows, UUID_RE } from "@/lib/db";
import { formatMoney, orderMoney } from "@/lib/types";
import type { Client, Order, OrderMoney, Payment, PaymentKind } from "@/lib/types";

export type PayableOrder = Order & {
  client: Pick<Client, "name" | "email">;
  payments: Payment[];
  picks: number;
  money: OrderMoney;
  /** Published gallery to send the client back to after paying, if any. */
  gallery_slug: string | null;
};

/** Favorites picked in the proof galleries attached to this session. */
async function countPicks(orderId: string): Promise<number> {
  const row = one<{ n: number }>(
    await db()`
      select count(*)::int as n
      from photo_selections ps
      join galleries g on g.id = ps.gallery_id
      where g.order_id = ${orderId} and g.kind = 'proof' and ps.selected`
  );
  return row?.n ?? 0;
}

async function listPayments(orderId: string): Promise<Payment[]> {
  return rows<Payment>(
    await db()`select * from payments where order_id = ${orderId} order by created_at asc`
  );
}

/** Public pay page lookup. Order ids are unguessable UUIDs shared by link. */
export async function getOrderForPayment(orderId: string): Promise<PayableOrder | null> {
  if (!UUID_RE.test(orderId)) return null;
  const order = one<Order & { client: Pick<Client, "name" | "email">; gallery_slug: string | null }>(
    await db()`
      select o.*, json_build_object('name', c.name, 'email', c.email) as client,
        (select g.slug from galleries g
           where g.order_id = o.id and g.status = 'published'
           order by (g.kind = 'final') desc, g.created_at desc limit 1) as gallery_slug
      from orders o
      join clients c on c.id = o.client_id
      where o.id = ${orderId}
      limit 1`
  );
  if (!order) return null;
  const [payments, picks] = await Promise.all([listPayments(orderId), countPicks(orderId)]);
  return { ...order, payments, picks, money: orderMoney(order, payments, picks) };
}

/** Money summary only, for gallery pages and the photo route. */
export async function getOrderMoney(orderId: string | null): Promise<OrderMoney | null> {
  if (!orderId || !UUID_RE.test(orderId)) return null;
  const order = one<Order>(await db()`select * from orders where id = ${orderId} limit 1`);
  if (!order || order.status === "cancelled") return null;
  const [payments, picks] = await Promise.all([listPayments(orderId), countPicks(orderId)]);
  return orderMoney(order, payments, picks);
}

/**
 * Most recent card payment for this order and kind that is still waiting on
 * Stripe. The pay page asks for a Checkout Session for every amount it offers
 * as soon as it opens, so this lets the API hand back the session it already
 * made instead of creating another one on each visit.
 */
export async function findPendingPayment(orderId: string, kind: PaymentKind): Promise<Payment | null> {
  return one<Payment>(
    await db()`
      select * from payments
      where order_id = ${orderId} and kind = ${kind} and status = 'pending'
        and stripe_checkout_session_id is not null
      order by created_at desc limit 1`
  );
}

export async function createPendingPayment(input: {
  orderId: string;
  kind: PaymentKind;
  amountCents: number;
  currency: string;
  sessionId: string;
}) {
  await db()`
    insert into payments (order_id, kind, amount_cents, currency, status, method, stripe_checkout_session_id)
    values (${input.orderId}, ${input.kind}, ${input.amountCents}, ${input.currency}, 'pending', 'card', ${input.sessionId})`;
}

/**
 * After any payment lands: a paid deposit books the session, a paid balance
 * stamps paid_at. Safe to call repeatedly.
 */
async function syncOrderAfterPayment(orderId: string) {
  const order = one<Order>(await db()`select * from orders where id = ${orderId} limit 1`);
  if (!order) return;
  const [payments, picks] = await Promise.all([listPayments(orderId), countPicks(orderId)]);
  const money = orderMoney(order, payments, picks);
  await db()`
    update orders set
      status = case when ${money.deposit_paid} and status in ('draft', 'pending_payment') then 'paid' else status end,
      paid_at = case when ${money.fully_paid} then coalesce(paid_at, now()) else null end,
      updated_at = now()
    where id = ${orderId}`;
}

/**
 * Marks the payment behind a Checkout Session as paid. Idempotent: called
 * from the webhook and from the success page, whichever comes first.
 */
export async function recordPaidCheckoutSession(input: {
  sessionId: string;
  paymentIntentId: string | null;
  amountTotal: number | null;
  /** GA visitor carried in the Checkout Session metadata, so the webhook can attribute the purchase. */
  visitor?: GaVisitor | null;
}) {
  const paid = one<Payment>(
    await db()`
      update payments
      set status = 'paid', paid_at = now(),
          amount_cents = coalesce(${input.amountTotal}, amount_cents),
          stripe_payment_intent_id = ${input.paymentIntentId}
      where stripe_checkout_session_id = ${input.sessionId} and status = 'pending'
      returning *`
  );
  if (!paid) return null; // already recorded, or unknown session
  await syncOrderAfterPayment(paid.order_id);
  await Promise.all([sendReceipt(paid), trackPurchase(paid, input.sessionId, input.visitor)]);
  return paid;
}

const paymentLabels: Record<PaymentKind, string> = {
  deposit: "Deposit",
  balance: "Balance",
  full: "Session",
  manual: "Manual payment",
};

/**
 * GA4 ecommerce purchase for a payment that just became paid. Fires once per
 * Checkout Session because recordPaidCheckoutSession only returns a row on the
 * pending → paid transition. Best effort; never blocks the payment.
 */
async function trackPurchase(paid: Payment, checkoutSessionId: string, visitor?: GaVisitor | null) {
  const value = paid.amount_cents / 100;
  const currency = paid.currency.toUpperCase();
  await sendServerEvent(
    GA_EVENTS.purchase,
    {
      transaction_id: checkoutSessionId,
      value,
      currency,
      items: [{ item_id: paid.kind, item_name: paymentLabels[paid.kind], price: value, quantity: 1 }],
    },
    visitor
  );
}

/** Cash, Zelle, check: recorded by the studio. */
export async function recordManualPayment(orderId: string, amountCents: number, currency = "usd") {
  if (amountCents <= 0) return null;
  const paid = one<Payment>(
    await db()`
      insert into payments (order_id, kind, amount_cents, currency, status, method, paid_at)
      values (${orderId}, 'manual', ${amountCents}, ${currency}, 'paid', 'manual', now())
      returning *`
  );
  if (paid) await syncOrderAfterPayment(orderId);
  return paid;
}

/** Removes the most recent manual payment. Card payments cannot be undone here. */
export async function undoLastManualPayment(orderId: string) {
  const removed = one<{ id: string }>(
    await db()`
      delete from payments
      where id = (select id from payments where order_id = ${orderId} and method = 'manual'
                  order by created_at desc limit 1)
      returning id`
  );
  if (removed) await syncOrderAfterPayment(orderId);
  return Boolean(removed);
}

export async function signContract(input: {
  orderId: string;
  name: string;
  ip: string | null;
  portfolioOk: boolean;
  version: string;
}) {
  return one<{ id: string }>(
    await db()`
      update orders set
        contract_version = ${input.version},
        contract_signed_at = now(),
        contract_signed_name = ${input.name},
        contract_signed_ip = ${input.ip},
        contract_portfolio_ok = ${input.portfolioOk},
        updated_at = now()
      where id = ${input.orderId} and contract_signed_at is null
      returning id`
  );
}

async function sendReceipt(payment: Payment) {
  const row = one<{ order_number: number; title: string; shoot_date: string | null; name: string; email: string }>(
    await db()`
      select o.order_number, o.title, o.shoot_date::text, c.name, c.email
      from orders o join clients c on c.id = o.client_id
      where o.id = ${payment.order_id} limit 1`
  );
  if (!row) return;
  const mail = await paymentReceiptEmail({
    clientName: row.name,
    orderNumber: row.order_number,
    title: row.title,
    amount: formatMoney(payment.amount_cents, payment.currency),
    shootDate: row.shoot_date,
  });
  // Best effort; the payment is recorded regardless.
  await sendEmail({ to: row.email, subject: mail.subject, text: mail.text, kind: "receipt" });
}
