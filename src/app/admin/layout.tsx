import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";
import { site } from "@/lib/site";
import { AdminNav } from "@/components/admin/ui";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { getAdminTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: { default: "Studio", template: "%s — Studio" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const [user, theme] = await Promise.all([requireAdminPage(), getAdminTheme()]);

  return (
    <div
      data-theme={theme}
      className="flex min-h-screen flex-col bg-paper text-ink md:flex-row"
    >
      <aside className="border-b border-line bg-paper-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r md:sticky md:top-0 md:h-screen md:flex md:flex-col">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <Link href="/admin" className="font-display text-sm tracking-[0.2em]">
            {site.name}
            <span className="mt-1 block font-sans text-[10px] font-normal normal-case tracking-[0.24em] text-muted">
              Studio
            </span>
          </Link>
          <Link href="/" className="text-xs uppercase tracking-[0.08em] text-ink-2 hover:text-ink md:mt-3 md:block">
            View site →
          </Link>
        </div>
        <div className="px-3 pb-4 md:pb-0">
          <AdminNav />
        </div>
        <div className="px-5 py-4 md:mt-auto">
          <ThemeToggle theme={theme} />
        </div>
        <div className="hidden px-5 py-6 text-xs text-muted md:block">
          <p className="truncate">{user.email}</p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button type="submit" className="text-ink-2 underline hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-paper px-5 py-8 md:px-10 md:py-10">{children}</main>
    </div>
  );
}
