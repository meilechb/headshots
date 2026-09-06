"use client";

import { useRouter } from "next/navigation";
import { THEME_COOKIE, type AdminTheme } from "@/lib/theme-shared";

export function ThemeToggle({ theme, compact = false }: { theme: AdminTheme; compact?: boolean }) {
  const router = useRouter();
  const next: AdminTheme = theme === "dark" ? "light" : "dark";

  function toggle() {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${THEME_COOKIE}=${next}; path=/admin; max-age=${oneYear}; samesite=lax`;
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-10 w-10 items-center justify-center border border-line text-base text-ink-2 transition hover:border-ink/40 hover:text-ink"
        aria-label={`Switch to ${next} mode`}
        title={`Switch to ${next} mode`}
      >
        <span aria-hidden>{theme === "dark" ? "☀" : "●"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex min-h-11 w-full items-center justify-between border border-line px-3 py-2 text-xs uppercase tracking-[0.08em] text-ink-2 transition hover:border-ink/40 hover:text-ink"
      aria-label={`Switch to ${next} mode`}
    >
      <span>{next === "light" ? "Light mode" : "Dark mode"}</span>
      <span aria-hidden>{theme === "dark" ? "☀" : "●"}</span>
    </button>
  );
}
