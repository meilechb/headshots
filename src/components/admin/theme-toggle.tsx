"use client";

import { useRouter } from "next/navigation";
import { THEME_COOKIE, type AdminTheme } from "@/lib/theme-shared";

export function ThemeToggle({ theme }: { theme: AdminTheme }) {
  const router = useRouter();
  const next: AdminTheme = theme === "dark" ? "light" : "dark";

  function toggle() {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${THEME_COOKIE}=${next}; path=/admin; max-age=${oneYear}; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center justify-between border border-line px-3 py-2 text-xs uppercase tracking-[0.08em] text-ink-2 transition hover:border-ink/40 hover:text-ink"
      aria-label={`Switch to ${next} mode`}
    >
      <span>{next === "light" ? "Light mode" : "Dark mode"}</span>
      <span aria-hidden>{theme === "dark" ? "☀" : "●"}</span>
    </button>
  );
}
