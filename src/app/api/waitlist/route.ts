import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_DEFAULT, getResend } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email().toLowerCase().trim(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const { email } = parsed.data;
    const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;

    let sb_error: string | null = null;
    let mail_error: string | null = null;

    try {
      const sb = getSupabaseAdminClient();
      const { error } = await sb
        .from("waitlist")
        .upsert(
          { email, ip, user_agent: userAgent, source: "landing" },
          { onConflict: "email", ignoreDuplicates: true },
        );
      if (error) sb_error = error.message;
    } catch (err) {
      sb_error = err instanceof Error ? err.message : String(err);
    }

    try {
      const resend = getResend();
      const { error } = await resend.emails.send({
        from: FROM_DEFAULT,
        to: email,
        subject: "Bienvenido a la beta de iActReady",
        html: `<p>Gracias por reservar tu plaza en la beta privada de <strong>iActReady</strong>.</p><p>Te escribiremos en cuanto abramos la beta (esperamos junio 2026).</p><p>— Equipo iActReady<br><a href="https://iactready.com">iactready.com</a></p>`,
      });
      if (error) mail_error = (error as { message?: string }).message || String(error);
    } catch (err) {
      mail_error = err instanceof Error ? err.message : String(err);
    }

    return NextResponse.json({ ok: true, sb_error, mail_error });
  } catch (err) {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    return NextResponse.json({ ok: false, fatal: msg }, { status: 500 });
  }
}
