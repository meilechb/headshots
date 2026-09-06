import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Bypasses Row Level Security, so it must only be used
 * from server code after the caller has been authorized in application code
 * (see src/lib/auth.ts and src/lib/gallery-access.ts).
 *
 * Used for flows where the visitor has no Supabase account: public contact
 * form, access-code-protected client galleries, and the Stripe webhook.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variable."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
