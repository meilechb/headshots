import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { markOrderPaid } from "@/lib/data/orders";
import { getStripe } from "@/lib/stripe";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
};

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  const session = await getStripe().checkout.sessions.retrieve(session_id);

  if (session.status === "open") {
    redirect(session.metadata?.order_id ? `/pay/${session.metadata.order_id}` : "/");
  }

  // Stripe recommends fulfilling from the landing page as well as the webhook,
  // because webhook delivery can lag. markOrderPaid is idempotent.
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  if (orderId && session.payment_status !== "unpaid") {
    await markOrderPaid({
      orderId,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
    });
  }

  const email = session.customer_details?.email;
  const amount = session.amount_total;

  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="card w-full max-w-lg p-8 text-center">
        <p className="eyebrow">Payment received</p>
        <h1 className="mt-3 font-display text-3xl">Thank you.</h1>
        <p className="mt-3 text-sm text-ink-2">
          {amount != null
            ? `Your payment of ${formatMoney(amount, session.currency ?? "usd")} went through.`
            : "Your payment went through."}{" "}
          {email ? `A receipt is on its way to ${email}.` : null}
        </p>
        <p className="mt-4 text-sm text-muted">
          I’ll follow up shortly to confirm your session details. Your photos
          will be delivered to a private online gallery afterward.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-secondary">
            Back to site
          </Link>
          <a href={`mailto:${site.email}`} className="btn-ghost">
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
