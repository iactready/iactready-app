"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "../env";

/**
 * Browser-side Supabase client.
 * Use in Client Components for realtime / interactive queries.
 * Respects RLS — always uses anon key.
 */
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!clientEnv.NEXT_PUBLIC_SUPABASE_URL || !clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Supabase env vars not configured");
  }
  if (!_client) {
    _client = createBrowserClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return _client;
}
