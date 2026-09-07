import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Meilech Biller, Headshot Photographer in Rockland County, NY",
  description: `Contact ${site.name} about a headshot session. Studio in ${site.address.locality}, NY, or on-site anywhere in Rockland County. Reply within one business day.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="container-x max-w-2xl py-14 md:py-20">
      <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Contact</h1>
      <div className="mt-8">
        <ContactForm email={site.email} />
      </div>
    </section>
  );
}
