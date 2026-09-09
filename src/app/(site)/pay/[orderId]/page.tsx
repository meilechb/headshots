import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contractSections } from "@/lib/contract";
import { getOrderForPayment } from "@/lib/data/orders";
import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";
import { PayFlow, type PayChoice } from "./pay-flow";

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
  const { money } = order;
  const cur = order.currency;

  const choices: PayChoice[] = [];
  if (!money.fully_paid) {
    if (!money.deposit_paid && money.deposit_due_cents > 0 && money.deposit_due_cents < money.due_cents) {
      choices.push({ kind: "deposit", label: "Pay deposit", amount_cents: money.deposit_due_cents });
      choices.push({ kind: "full", label: "Pay in full", amount_cents: money.due_cents });
    } else {
      choices.push({ kind: money.paid_cents > 0 ? "balance" : "full", label: "Pay", amount_cents: money.due_cents });
    }
  }

  const contract = contractSections({
    clientName: order.client.name,
    title: order.title,
    shootDate: order.shoot_date,
    priceCents: order.amount_cents,
    depositCents: order.deposit_cents,
    includedFinals: order.included_finals,
    extraFinalCents: order.extra_final_cents,
    currency: cur,
  });

  // Rendered on the server and handed to the client flow, which decides where
  // it sits: alone in one card, or in the left column beside the payment form.
  const summary = (
    <>
      <h1 className="font-display text-3xl">{order.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {order.client.name}
        {order.shoot_date
          ? ` · ${new Date(order.shoot_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
          : ""}
      </p>
      {order.description ? <p className="mt-4 whitespace-pre-line text-sm text-ink-2">{order.description}</p> : null}

      <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-muted">Session</dt>
          <dd>{formatMoney(money.price_cents, cur)}</dd>
        </div>
        {money.extra_picks > 0 ? (
          <div className="flex justify-between py-3">
            <dt className="text-muted">
              {money.extra_picks} extra photo{money.extra_picks === 1 ? "" : "s"} × {formatMoney(order.extra_final_cents, cur)}
            </dt>
            <dd>{formatMoney(money.extras_cents, cur)}</dd>
          </div>
        ) : null}
        {money.paid_cents > 0 ? (
          <div className="flex justify-between py-3">
            <dt className="text-muted">Paid</dt>
            <dd>{formatMoney(money.paid_cents, cur)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between py-3 text-base font-medium">
          <dt>{money.fully_paid ? "Total" : "Balance"}</dt>
          <dd>{formatMoney(money.fully_paid ? money.total_cents : money.due_cents, cur)}</dd>
        </div>
      </dl>
    </>
  );

  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      {money.fully_paid ? (
        <div className="card w-full max-w-lg p-8">
          {summary}
          <div className="mt-6 space-y-4 text-sm">
            <p>Paid in full. Thank you.</p>
            {order.gallery_slug ? (
              <Link href={`/g/${order.gallery_slug}`} className="btn-primary">Open your gallery</Link>
            ) : null}
          </div>
        </div>
      ) : (
        <PayFlow
          summary={summary}
          orderId={order.id}
          publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null}
          signed={Boolean(order.contract_signed_at)}
          needsContract={!money.deposit_paid}
          contract={contract}
          choices={choices}
          currency={cur}
          email={site.email}
        />
      )}
    </section>
  );
}
