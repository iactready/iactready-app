import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv, serverEnv } from "../env";

/**
 * Server-side Supabase client with anon key (RLS-aware).
 * Use for queries on behalf of the logged-in user.
 */
export async function getSupabaseServerClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars not configured");
  }
  const cookieStore = await cookies();
  return createServerClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can not write cookies, middleware refreshes tokens.
        }
      },
    },
  });
}

/**
 * Admin Supabase client with service_role. Bypasses RLS.
 * Use ONLY for trusted server operations (webhooks, cron, internal triggers).
 * Uses the regular createClient (no cookies, no SSR), which is the correct path for service_role.
 */
export function getSupabaseAdminClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars not configured");
  }
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
