"use server";

import { redirect } from "next/navigation";
import { authConfigured, verifyAdminCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (!authConfigured()) {
    return {
      error:
        "Admin login is not configured on this deployment. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET.",
    };
  }
  if (!verifyAdminCredentials(email, password)) {
    return { error: "Incorrect email or password." };
  }

  await createSession(email.trim().toLowerCase());
  redirect(next.startsWith("/") ? next : "/admin");
}
