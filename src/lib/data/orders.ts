import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Client, Order } from "@/lib/types";

export type PayableOrder = Order & { client: Pick<Client, "name" | "email"> };

/** Public pay page lookup. Order ids are unguessable UUIDs shared by link. */
export async function getOrderForPayment(
  orderId: string
): Promise<PayableOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select("*, client:clients(name, email)")
    .eq("id", orderId)
    .maybeSingle();
  return (data as unknown as PayableOrder | null) ?? null;
}

export async function attachCheckoutSession(orderId: string, sessionId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({ stripe_checkout_session_id: sessionId })
    .eq("id", orderId);
}

/** Idempotent: a paid order stays paid. Called from the Stripe webhook. */
export async function markOrderPaid(input: {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
}) {
  const supabase = createAdminClient();
  await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_checkout_session_id: input.sessionId,
      stripe_payment_intent_id: input.paymentIntentId,
    })
    .eq("id", input.orderId)
    .in("status", ["draft", "pending_payment"]);
}
