import { NextResponse, type NextRequest } from "next/server";
import { gaVisitorToMetadata, readGaVisitor } from "@/lib/analytics-server";
import { createPendingPayment, findPendingPayment, getOrderForPayment } from "@/lib/data/orders";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";
import type { PaymentKind } from "@/lib/types";

/**
 * Returns the client secret of a Checkout Session for the embedded Payment
 * Element, reusing an open one for the same order, kind and amount when it
 * exists and creating one otherwise. Amounts always come from the database,
 * never from the client.
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

  // The pay page requests a session for every amount it offers as soon as it
  // opens, so the form is ready before the client picks one. Hand back the
  // session from an earlier visit while it is still open and for the same
  // amount; Stripe keeps a Checkout Session open for 24 hours.
  const pending = await findPendingPayment(order.id, kind);
  if (pending?.stripe_checkout_session_id) {
    try {
      const existing = await getStripe().checkout.sessions.retrieve(pending.stripe_checkout_session_id);
      if (existing.status === "open" && existing.amount_total === amount && existing.client_secret) {
        return NextResponse.json({ clientSecret: existing.client_secret, sessionId: existing.id });
      }
    } catch {
      // Unknown or deleted session: fall through and create a fresh one.
    }
  }

  const origin = request.nextUrl.origin || site.url;
  // The payer's GA client and session ids ride along in the metadata so the
  // purchase event can be attributed even when the webhook records it.
  const gaMetadata = gaVisitorToMetadata(await readGaVisitor());
  const session = await getStripe().checkout.sessions.create({
    ui_mode: "elements",
    mode: "payment",
    // Cards only, plus the wallets that ride on cards (Apple Pay and Google
    // Pay). Listing the types here replaces the Dashboard's dynamic payment
    // methods, which is what was surfacing Affirm, Klarna and Amazon Pay as
    // payment method types. `excluded_payment_method_types` is only for
    // sessions whose methods are managed in the Dashboard, so it is not used;
    // with a fixed list nothing toggled on there can reach this page.
    payment_method_types: ["card"],
    // Link is a wallet, not a payment method type, so the list above does not
    // touch it. Left on, Link adds its own "Pay later with Klarna" and "Bank"
    // rows to the form. It is switched off here at the session, and again on
    // the Payment Element and Express Checkout Element in pay-flow.tsx.
    wallet_options: { link: { display: "never" } },
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
    metadata: { order_id: order.id, kind, ...gaMetadata },
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
