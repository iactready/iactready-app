import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /auth/callback?code=...&next=/inventory
 *
 * Supabase magic-link landing. Exchanges the code for a session cookie,
 * then redirects to `next` (or /inventory by default).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inventory";

  if (code) {
    const sb = await getSupabaseServerClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/callback]", error.message);
  }
  return NextResponse.redirect(`${origin}/login?error=callback`);
}
