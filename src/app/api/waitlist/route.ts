import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_DEFAULT, getResend } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email().toLowerCase().trim(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist
 * Body: { email: string }
 *
 * Idempotent: inserts into public.waitlist (service_role bypasses RLS).
 * Sends confirmation email via Resend.
 * Side-effect failures are logged but never fail the user request.
 */
export async function POST(request: Request) {
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

  try {
    const sb = getSupabaseAdminClient();
    const { error } = await sb
      .from("waitlist")
      .upsert(
        { email, ip, user_agent: userAgent, source: "landing" },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (error) console.error("[waitlist] supabase:", error.message);
  } catch (err) {
    console.error("[waitlist] supabase threw (non-fatal):", err);
  }

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_DEFAULT,
      to: email,
      subject: "Bienvenido a la beta de iActReady",
      html: `<p>Hola,</p>
<p>Gracias por reservar tu plaza en la beta privada de <strong>iActReady</strong>.</p>
<p>Te escribiremos en cuanto abramos la beta (esperamos junio 2026). Mientras tanto:</p>
<ul>
  <li>📚 EU AI Act overview: <a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai">EU Commission</a></li>
  <li>💬 Si tienes preguntas concretas, respóndenos a este email.</li>
</ul>
<p>— Equipo iActReady<br><a href="https://iactready.com">iactready.com</a></p>`,
    });
    if (error) console.error("[waitlist] resend:", error);
  } catch (err) {
    console.error("[waitlist] resend threw (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
