import { NextResponse, type NextRequest } from "next/server";
import { createPendingPayment, getOrderForPayment } from "@/lib/data/orders";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";
import type { PaymentKind } from "@/lib/types";

/**
 * Creates a Checkout Session for the embedded Payment Element and returns its
 * client secret. Amounts always come from the database, never from the client.
 * Body: { orderId, kind: "deposit" | "full" | "balance" }
 */
export async function POST(request: NextRequest) {
  let body: { orderId?: string; kind?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const order = await getOrderForPayment(String(body.orderId ?? ""));
  if (!order || order.status === "draft" || order.status === "cancelled") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  const { money } = order;
  if (money.fully_paid) {
    return NextResponse.json({ error: "Nothing left to pay." }, { status: 400 });
  }

  const kind: PaymentKind = body.kind === "deposit" ? "deposit" : body.kind === "balance" ? "balance" : "full";
  let amount = 0;
  let label = "";
  if (kind === "deposit") {
    if (money.deposit_paid) return NextResponse.json({ error: "The deposit is already paid." }, { status: 400 });
    amount = money.deposit_due_cents;
    label = "Deposit";
  } else if (kind === "balance") {
    amount = money.due_cents;
    label = "Balance";
  } else {
    amount = money.due_cents;
    label = money.paid_cents > 0 ? "Balance" : "Session";
  }
  if (amount <= 0) return NextResponse.json({ error: "Nothing left to pay." }, { status: 400 });
  if (!money.deposit_paid && !order.contract_signed_at) {
    return NextResponse.json({ error: "Please agree to the terms first." }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payments are not set up yet." }, { status: 503 });
  }

  const origin = request.nextUrl.origin || site.url;
  const session = await getStripe().checkout.sessions.create({
    ui_mode: "elements",
    mode: "payment",
    customer_email: order.client.email,
    client_reference_id: order.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency,
          unit_amount: amount,
          product_data: { name: `${label}: ${order.title}` },
        },
      },
    ],
    metadata: { order_id: order.id, kind },
    payment_intent_data: { metadata: { order_id: order.id, kind } },
    return_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret) {
    return NextResponse.json({ error: "Stripe did not return a client secret" }, { status: 500 });
  }
  await createPendingPayment({
    orderId: order.id,
    kind,
    amountCents: amount,
    currency: order.currency,
    sessionId: session.id,
  });
  return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id });
}
