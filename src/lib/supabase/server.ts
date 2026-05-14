import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv, serverEnv } from "../env";

/**
 * Server-side Supabase client with anon key (RLS-aware).
 * Use this for queries on behalf of the logged-in user.
 */
export async function getSupabaseServerClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars not configured");
  }
  const cookieStore = await cookies();
  return createServerClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components can't write cookies — middleware will refresh tokens.
        }
      },
    },
  });
}

/**
 * Admin Supabase client with service_role.
 * Bypasses RLS. Use ONLY for trusted server operations
 * (cron jobs, webhooks, internal triggers). NEVER expose to client.
 */
export function getSupabaseAdminClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase admin env vars not configured");
  }
  // Note: createServerClient with service_role bypasses RLS — we don't track cookies here.
  return createServerClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
