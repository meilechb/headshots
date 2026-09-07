import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { recordPaidCheckoutSession } from "@/lib/data/orders";
import { db, one } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
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

  if (session.status === "open" || session.payment_status === "unpaid") {
    redirect(session.metadata?.order_id ? `/pay/${session.metadata.order_id}` : "/");
  }

  // Stripe recommends recording from the landing page as well as the webhook,
  // because webhook delivery can lag. recordPaidCheckoutSession is idempotent.
  await recordPaidCheckoutSession({
    sessionId: session.id,
    amountTotal: session.amount_total,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
  });

  const info = one<{ order_id: string; due: boolean; gallery_slug: string | null }>(
    await db()`
      select p.order_id,
        (o.paid_at is null) as due,
        (select g.slug from galleries g
           where g.order_id = o.id and g.status = 'published'
           order by (g.kind = 'final') desc, g.created_at desc limit 1) as gallery_slug
      from payments p join orders o on o.id = p.order_id
      where p.stripe_checkout_session_id = ${session.id} limit 1`
  );

  const amount = session.amount_total;
  const email = session.customer_details?.email;

  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="card w-full max-w-lg p-8 text-center">
        <h1 className="font-display text-3xl">Thank you</h1>
        <p className="mt-3 text-sm text-ink-2">
          {amount != null ? `Payment of ${formatMoney(amount, session.currency ?? "usd")} received.` : "Payment received."}
          {email ? ` Receipt sent to ${email}.` : ""}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {info?.gallery_slug ? (
            <Link href={`/g/${info.gallery_slug}`} className="btn-primary">Open your gallery</Link>
          ) : null}
          {info?.due ? (
            <Link href={`/pay/${info.order_id}`} className="btn-secondary">Back to your session</Link>
          ) : (
            <Link href="/" className="btn-secondary">Back to site</Link>
          )}
        </div>
      </div>
    </section>
  );
}
