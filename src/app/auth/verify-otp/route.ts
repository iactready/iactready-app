import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /auth/verify-otp?token_hash=<hash>&type=magiclink&next=/inventory
 *
 * Handles the non-PKCE magic-link flow. Useful for admin-generated links and
 * for any email template that uses the new `token_hash` pattern.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") || "magiclink") as EmailOtpType;
  const next = searchParams.get("next") ?? "/inventory";

  if (token_hash) {
    const sb = await getSupabaseServerClient();
    const { error } = await sb.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[auth/verify-otp]", error.message);
  }
  return NextResponse.redirect(`${origin}/login?error=verify`);
}
