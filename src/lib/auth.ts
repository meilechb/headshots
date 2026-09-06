import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  role: "admin" | "client";
};

/**
 * Data Access Layer entry point for the signed-in user.
 * Cached per request so layouts, pages and actions can all call it.
 */
export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!supabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    role: profile?.role === "admin" ? "admin" : "client",
  };
});

/** Redirects to /login when signed out, to / when signed in but not admin. */
export async function requireAdminPage(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/?error=forbidden");
  return user;
}

/**
 * For server actions and route handlers. Throws instead of redirecting so the
 * caller returns a proper error to the client. Every mutation must call this;
 * a page-level check does not protect the actions defined within it.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return user;
}
