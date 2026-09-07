"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CONTRACT_VERSION, contractSections } from "@/lib/contract";
import { getOrderForPayment, signContract as saveSignature } from "@/lib/data/orders";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

export type SignState = { ok?: boolean; error?: string };

export async function signContract(orderId: string, _prev: SignState, formData: FormData): Promise<SignState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (name.length < 2) return { error: "Type your full name." };
  if (formData.get("agree") !== "on") return { error: "Tick the box to agree." };

  const order = await getOrderForPayment(orderId);
  if (!order || order.status === "draft" || order.status === "cancelled") return { error: "Session not found." };
  if (order.contract_signed_at) return { ok: true };

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim().slice(0, 64) : null;
  const portfolioOk = formData.get("portfolio_ok") === "on";

  await saveSignature({ orderId, name, ip, portfolioOk, version: CONTRACT_VERSION });

  // A copy for the client. Best effort; the signature is recorded regardless.
  const sections = contractSections({
    clientName: order.client.name,
    title: order.title,
    shootDate: order.shoot_date,
    priceCents: order.amount_cents,
    depositCents: order.deposit_cents,
    includedFinals: order.included_finals,
    extraFinalCents: order.extra_final_cents,
    currency: order.currency,
  });
  const text = [
    `Hi ${order.client.name.split(" ")[0]},`,
    "",
    `Here is a copy of the agreement you signed on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
    "",
    ...sections.flatMap((s) => [s.heading.toUpperCase(), ...s.body, ""]),
    `Signed by ${name}. Portfolio use: ${portfolioOk ? "allowed" : "not allowed"}.`,
    "",
    site.name,
    site.email,
  ].join("\n");
  await sendEmail({ to: order.client.email, subject: `Your agreement: ${site.name}`, text, kind: "agreement" });

  revalidatePath(`/pay/${orderId}`);
  return { ok: true };
}
