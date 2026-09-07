import { NextResponse, type NextRequest } from "next/server";
import { attachCheckoutSession, getOrderForPayment } from "@/lib/data/orders";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";

/**
 * Creates a Stripe Checkout Session for an order and redirects to it.
 * Invoked by the form on /pay/[orderId]. Amounts always come from the
 * database, never from the client.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const orderId = String(form.get("orderId") ?? "");
  const order = await getOrderForPayment(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending_payment") {
    return NextResponse.redirect(new URL(`/pay/${order.id}`, request.url), 303);
  }

  const origin = request.nextUrl.origin || site.url;
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.client.email,
    client_reference_id: order.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency,
          unit_amount: order.amount_cents,
          product_data: {
            name: `${order.title}, order #${order.order_number}`,
            description: order.description ?? undefined,
          },
        },
      },
    ],
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    success_url: `${origin}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pay/${order.id}`,
  });

  await attachCheckoutSession(order.id, session.id);

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a URL" }, { status: 500 });
  }
  return NextResponse.redirect(session.url, 303);
}
