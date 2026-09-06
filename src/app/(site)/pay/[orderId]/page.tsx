import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderForPayment } from "@/lib/data/orders";
import { site } from "@/lib/site";
import { formatMoney, orderStatusLabels } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pay for your session",
  robots: { index: false, follow: false },
};

export default async function PayPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderForPayment(orderId);
  if (!order || order.status === "draft" || order.status === "cancelled") {
    notFound();
  }

  const payable = order.status === "pending_payment";

  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <div className="card w-full max-w-lg p-8">
        <p className="eyebrow">Order #{order.order_number}</p>
        <h1 className="mt-3 font-display text-3xl">{order.title}</h1>
        <p className="mt-1 text-sm text-muted">For {order.client.name}</p>
        {order.description ? (
          <p className="mt-4 whitespace-pre-line text-sm text-ink-2">
            {order.description}
          </p>
        ) : null}

        <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
          {order.shoot_date ? (
            <div className="flex justify-between py-3">
              <dt className="text-muted">Session date</dt>
              <dd>
                {new Date(order.shoot_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between py-3">
            <dt className="text-muted">Status</dt>
            <dd>{orderStatusLabels[order.status]}</dd>
          </div>
          <div className="flex justify-between py-3 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(order.amount_cents, order.currency)}</dd>
          </div>
        </dl>

        {payable ? (
          <form action="/api/checkout" method="POST" className="mt-6">
            <input type="hidden" name="orderId" value={order.id} />
            <button type="submit" className="btn-primary w-full">
              Pay {formatMoney(order.amount_cents, order.currency)} securely
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              Card, Apple Pay and Google Pay via Stripe. You’ll return here
              after payment.
            </p>
          </form>
        ) : (
          <div className="mt-6 rounded-lg bg-paper-2 p-4 text-sm">
            {order.paid_at ? (
              <>
                Paid on{" "}
                {new Date(order.paid_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                . Thank you.
              </>
            ) : (
              <>This order isn’t awaiting payment right now.</>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-muted">
          Questions? Email{" "}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
