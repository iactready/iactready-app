import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_DEFAULT, getResend } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export const runtime = "nodejs";

/**
 * POST /api/waitlist
 *
 * Body: { email: string }
 *
 * Side effects (best-effort, never block response):
 *  1. Insert into public.waitlist table (idempotent on email).
 *  2. Send confirmation email via Resend.
 *
 * Returns 200 if email is valid format, regardless of side-effect outcomes.
 * Side-effect failures are logged server-side; the user always sees "thanks".
 * This prevents enumeration attacks and keeps the UX smooth.
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

  // Side-effect 1: persist to Supabase if configured.
  try {
    const sb = getSupabaseAdminClient();
    await sb
      .from("waitlist")
      .upsert(
        {
          email,
          ip,
          user_agent: userAgent,
          source: "landing",
        },
        { onConflict: "email", ignoreDuplicates: true },
      );
  } catch (err) {
    console.error("[waitlist] supabase insert failed (non-fatal):", err);
  }

  // Side-effect 2: confirmation email.
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_DEFAULT,
      to: email,
      subject: "Bienvenido a la beta de iActReady",
      html: `
        <p>Hola,</p>
        <p>Gracias por reservar tu plaza en la beta privada de <strong>iActReady</strong>.</p>
        <p>Te escribiremos en cuanto abramos la beta (esperamos junio 2026). Mientras tanto:</p>
        <ul>
          <li>📚 Si quieres saber más sobre el EU AI Act, este es un buen punto de partida:
            <a href="https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai">EU Commission · AI Act overview</a>
          </li>
          <li>💬 Si tienes preguntas concretas sobre tu caso, respóndenos a este email.</li>
        </ul>
        <p>— Equipo iActReady<br>
        <a href="https://iactready.com">iactready.com</a></p>
      `,
    });
  } catch (err) {
    console.error("[waitlist] resend send failed (non-fatal):", err);
  }

  return NextResponse.json({ ok: true });
}
