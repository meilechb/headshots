import { site } from "@/lib/site";
import { formatMoney } from "@/lib/types";

/** Bump when the wording changes; the version is stored with every signature. */
export const CONTRACT_VERSION = "2026-09";

export type ContractSection = { heading: string; body: string[] };

export type ContractInput = {
  clientName: string;
  title: string;
  shootDate: string | null;
  priceCents: number;
  depositCents: number;
  includedFinals: number;
  extraFinalCents: number;
  currency?: string;
};

function longDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Photography services agreement. Built from the terms that are standard in
 * portrait and headshot contracts: retainer, balance, rescheduling,
 * cancellation, delivery, copyright and usage, liability.
 */
export function contractSections(input: ContractInput): ContractSection[] {
  const cur = input.currency ?? "usd";
  const price = formatMoney(input.priceCents, cur);
  const deposit = formatMoney(input.depositCents, cur);
  const balance = formatMoney(Math.max(0, input.priceCents - input.depositCents), cur);
  const when = input.shootDate ? longDate(input.shootDate) : "a date agreed by email";
  const extras =
    input.includedFinals > 0 && input.extraFinalCents > 0
      ? `The price includes ${input.includedFinals} final retouched image${input.includedFinals === 1 ? "" : "s"}. Each additional image chosen is ${formatMoney(input.extraFinalCents, cur)} and is added to the balance.`
      : "The number of final retouched images is stated in the session description.";

  return [
    {
      heading: "Parties",
      body: [
        `This agreement is between ${site.legalName} ("Photographer") and ${input.clientName} ("Client") for the session "${input.title}" on ${when}.`,
      ],
    },
    {
      heading: "Fee and payment",
      body: [
        `The session fee is ${price}. A retainer of ${deposit} is due to reserve the date. The remaining balance of ${balance} is due when the final images are delivered, and may be paid at any time before that.`,
        extras,
        "Final images are released for download once the balance is paid in full.",
      ],
    },
    {
      heading: "Rescheduling and cancellation",
      body: [
        "The retainer reserves the date and is non-refundable. The Client may reschedule once at no charge with at least 48 hours notice, and the retainer carries over to the new date within 90 days.",
        "If the Client cancels or does not attend, the retainer is kept. If the Photographer must cancel because of illness, emergency or equipment failure, the Photographer will offer a new date or refund every amount paid, which is the full extent of the Photographer's liability.",
      ],
    },
    {
      heading: "The session",
      body: [
        "The Client agrees to arrive on time. Time lost to a late arrival comes out of the session and is not made up or refunded.",
        "For on-location sessions the Client provides a space of roughly 8 by 10 feet with access to a power outlet.",
      ],
    },
    {
      heading: "Proofs, selection and delivery",
      body: [
        "Lightly edited proofs are posted to a private online gallery within two business days of the session. The Client marks the images to be retouched.",
        "Retouched final images are delivered to the online gallery within five business days of the selection. Retouching covers skin, stray hairs, blemishes and minor clothing fixes. Requests beyond that are quoted separately.",
        "Unedited original files are not delivered. Files stay online for 90 days after delivery; the Client is responsible for downloading and backing them up.",
      ],
    },
    {
      heading: "Copyright and use",
      body: [
        "The Photographer owns the copyright in all images. The Client receives a licence to use the final images for personal and business purposes, including websites, social media, print and press, without time limit.",
        "The final images may not be sold, entered in competitions, or edited beyond cropping. Filters and re-editing are not permitted. Credit to the Photographer is appreciated where practical.",
        "With the Client's permission (given below), the Photographer may show the images in a portfolio, on the website and on social media. The Client can withdraw this permission at any time by email.",
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "The Photographer takes every reasonable care with the images. If files are lost or damaged before delivery through no fault of the Client, the Photographer will re-shoot at no charge or refund the amounts paid. Liability under this agreement is limited to the total amount paid by the Client.",
      ],
    },
    {
      heading: "General",
      body: [
        "This is the whole agreement between the parties and is governed by the laws of the State of New York. Typing your name below and clicking Agree has the same effect as a handwritten signature.",
      ],
    },
  ];
}
