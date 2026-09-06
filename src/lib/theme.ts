import "server-only";

import { cookies } from "next/headers";
import { THEME_COOKIE, type AdminTheme } from "./theme-shared";

export { THEME_COOKIE, type AdminTheme };

/**
 * Studio admin light/dark preference. Unsigned and non-sensitive (just a
 * display setting), so ThemeToggle can read/write it directly from the
 * browser via document.cookie. The public site and client galleries don't
 * read this cookie and always render the dark palette.
 */
export async function getAdminTheme(): Promise<AdminTheme> {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return value === "light" ? "light" : "dark";
}
