import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  oposicion_id: z.string().default("aux-admin-estado-c2"),
  level_experience: z.enum(["starter", "one_year", "experienced"]).default("starter"),
  daily_question_goal: z.number().int().min(5).max(50).default(20),
  display_name: z.string().min(1).max(100).optional(),
  target_exam_date: z.string().optional(),
});

/** GET /api/profile — read current user's opositor profile (404 if not yet set). */
export async function GET() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await sb.from("o_profile").select("*").eq("user_id", user.id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

/** POST /api/profile — create the user's profile (one-time). */
export async function POST(request: Request) {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Confirm oposición exists
  const { data: op } = await sb.from("o_oposicion").select("id").eq("id", parsed.data.oposicion_id).maybeSingle();
  if (!op) return NextResponse.json({ error: "Oposición not found" }, { status: 404 });

  // Already exists? Update instead.
  const { data: existing } = await sb.from("o_profile").select("id").eq("user_id", user.id).maybeSingle();
  if (existing) {
    const { data: updated, error } = await sb
      .from("o_profile")
      .update({
        oposicion_id: parsed.data.oposicion_id,
        level_experience: parsed.data.level_experience,
        daily_question_goal: parsed.data.daily_question_goal,
        display_name: parsed.data.display_name ?? null,
        target_exam_date: parsed.data.target_exam_date ?? null,
      })
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updated);
  }

  const { data, error } = await sb
    .from("o_profile")
    .insert({
      user_id: user.id,
      oposicion_id: parsed.data.oposicion_id,
      level_experience: parsed.data.level_experience,
      daily_question_goal: parsed.data.daily_question_goal,
      display_name: parsed.data.display_name ?? null,
      target_exam_date: parsed.data.target_exam_date ?? null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
