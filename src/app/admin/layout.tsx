import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { site } from "@/lib/site";
import { AdminNav } from "@/components/admin/ui";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s — Studio" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdminPage();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-line bg-paper-2/60 md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href="/admin" className="font-display text-xl tracking-tight">
            {site.name}
            <span className="ml-2 font-sans text-[10px] uppercase tracking-[0.18em] text-muted">
              Studio
            </span>
          </Link>
          <Link href="/" className="text-xs text-muted hover:text-ink md:mt-1 md:block">
            View site →
          </Link>
        </div>
        <div className="px-3 pb-4 md:pb-0">
          <AdminNav />
        </div>
        <div className="hidden px-5 py-6 text-xs text-muted md:block">
          <p className="truncate">{user.email}</p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button type="submit" className="underline hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
