import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { classifyAiSystem } from "@/lib/classifier";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(4000),
  category: z.string().nullish(),
  provider: z.string().nullish(),
  in_house: z.boolean(),
  operates_on_personal_data: z.boolean(),
  affects_individuals: z.boolean(),
  human_oversight: z.string().nullish(),
  countries_of_operation: z.array(z.string()).default([]),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/inventory — list current users orgs ai_systems (RLS handles scoping). */
export async function GET() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await sb
    .from("ai_systems")
    .select("id, name, description, category, provider, risk_classification, risk_reasoning, obligations, classified_at, created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ai_systems: data ?? [] });
}

/**
 * POST /api/inventory
 * Body: { name, description, category?, provider?, in_house, operates_on_personal_data, affects_individuals, human_oversight?, countries_of_operation? }
 *
 * Creates a new ai_system row for the users org, then classifies it with Claude
 * and stores the result back on the row. Returns the persisted row.
 */
export async function POST(request: Request) {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  // Find the users org (single-org-per-user in MVP).
  const { data: org, error: orgErr } = await sb.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 });
  if (!org) return NextResponse.json({ error: "No organization. Complete onboarding first." }, { status: 409 });

  // Insert the system unclassified.
  const { data: inserted, error: insErr } = await sb
    .from("ai_systems")
    .insert({
      org_id: org.id,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category ?? null,
      provider: parsed.data.provider ?? null,
      in_house: parsed.data.in_house,
      operates_on_personal_data: parsed.data.operates_on_personal_data,
      affects_individuals: parsed.data.affects_individuals,
      human_oversight: parsed.data.human_oversight ?? null,
      countries_of_operation: parsed.data.countries_of_operation,
    })
    .select("id")
    .single();
  if (insErr || !inserted) return NextResponse.json({ error: insErr?.message ?? "Insert failed" }, { status: 500 });

  // Classify (may take up to ~20s).
  let classified;
  try {
    classified = await classifyAiSystem({
      ...parsed.data,
      category: parsed.data.category ?? null,
      provider: parsed.data.provider ?? null,
      human_oversight: parsed.data.human_oversight ?? null,
      countries_of_operation: parsed.data.countries_of_operation,
    });
  } catch (err) {
    // Leave the row as unclassified; the user can retry via /reclassify.
    console.error("[inventory] classify failed:", err);
    return NextResponse.json(
      { id: inserted.id, risk_classification: "unclassified", error: "Classification failed; retry later." },
      { status: 200 },
    );
  }

  const { data: updated, error: updErr } = await sb
    .from("ai_systems")
    .update({
      risk_classification: classified.risk_tier,
      risk_reasoning: classified.reasoning,
      obligations: { obligations: classified.obligations, flagged_concerns: classified.flagged_concerns },
      classified_at: new Date().toISOString(),
    })
    .eq("id", inserted.id)
    .select("*")
    .single();
  if (updErr || !updated) return NextResponse.json({ error: updErr?.message ?? "Update failed" }, { status: 500 });

  return NextResponse.json(updated);
}
