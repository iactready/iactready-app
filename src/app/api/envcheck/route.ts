import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_resend: !!process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_DEFAULT || null,
    app_url: process.env.NEXT_PUBLIC_APP_URL || null,
    node: process.version,
  });
}
