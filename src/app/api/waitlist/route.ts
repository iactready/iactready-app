import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_DEFAULT, getResend } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.email().toLowerCase().trim() });
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  const { email } = parsed.data;
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;

  // DEBUG MODE: surface errors instead of swallowing them
  let sb_result: unknown = null;
  let sb_error: string | null = null;
  let mail_result: unknown = null;
  let mail_error: string | null = null;
  try {
    const sb = getSupabaseAdminClient();
    const r = await sb.from("waitlist").upsert(
      { email, ip, user_agent: userAgent, source: "landing" },
      { onConflict: "email", ignoreDuplicates: true },
    );
    sb_result = { status: r.status, statusText: r.statusText, count: r.count };
    if (r.error) sb_error = r.error.message + " | code=" + r.error.code + " | details=" + (r.error.details || "");
  } catch (err) { sb_error = err instanceof Error ? err.message : String(err); }
  try {
    const resend = getResend();
    const r = await resend.emails.send({
      from: FROM_DEFAULT, to: email, subject: "Bienvenido a la beta de iActReady",
      html: "<p>Gracias por reservar tu plaza en iActReady.</p>",
    });
    mail_result = r.data;
    if (r.error) mail_error = JSON.stringify(r.error);
  } catch (err) { mail_error = err instanceof Error ? err.message : String(err); }
  return NextResponse.json({ ok: true, email, sb_result, sb_error, mail_result, mail_error });
}
