import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Studio login",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect("/admin");

  return (
    <main className="min-h-screen grid place-items-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl tracking-tight">
          {site.name}
        </Link>
        <h1 className="mt-8 font-display text-3xl">Studio login</h1>
        <p className="mt-2 text-sm text-muted">
          For the photographer. Clients open galleries from the link in their
          email.
        </p>
        <div className="mt-8">
          <LoginForm next={next && next.startsWith("/") ? next : "/admin"} />
        </div>
      </div>
    </main>
  );
}
