import { NextResponse } from "next/server";
import { z } from "zod";
import { FROM_DEFAULT, getResend } from "@/lib/resend";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.email().toLowerCase().trim() });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set([
  "https://iactready.com",
  "https://www.iactready.com",
  "https://app.iactready.com",
  "http://localhost:3000",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://iactready.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function clientIp(request: Request): string | null {
  const raw =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-nf-client-connection-ip") ??
    request.headers.get("x-forwarded-for");
  if (!raw) return null;
  const first = raw.split(",")[0].trim();
  return first.length > 0 ? first : null;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

/**
 * POST /api/waitlist  Body: { email: string }
 *
 * Idempotent upsert into public.waitlist (service_role bypasses RLS) + transactional
 * confirmation via Resend. Side-effect failures are logged but never fail the request.
 */
export async function POST(request: Request) {
  const cors = corsHeaders(request.headers.get("origin"));

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400, headers: cors });
  }
  const { email } = parsed.data;
  const ip = clientIp(request);
  const userAgent = request.headers.get("user-agent") ?? null;

  try {
    const sb = getSupabaseAdminClient();
    const { error } = await sb
      .from("waitlist")
      .upsert(
        { email, ip, user_agent: userAgent, source: "landing" },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (error) console.error("[waitlist] supabase:", error.message, error.code, error.details);
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
  <li>💬 ¿Preguntas concretas? Respóndenos a este email.</li>
</ul>
<p>— Equipo iActReady<br><a href="https://iactready.com">iactready.com</a></p>`,
    });
    if (error) console.error("[waitlist] resend:", error);
  } catch (err) {
    console.error("[waitlist] resend threw (non-fatal):", err);
  }

  return NextResponse.json({ ok: true }, { headers: cors });
}
