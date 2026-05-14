import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { auditBusiness } from "@/lib/audit";

const interviewSchema = z.object({
  business_description: z.string().min(1).max(2000),
  content_creation: z.object({ uses: z.boolean(), details: z.string().max(2000).default("") }),
  decisions_on_people: z.object({ uses: z.boolean(), details: z.string().max(2000).default("") }),
  customer_chatbot: z.object({ uses: z.boolean(), details: z.string().max(2000).default("") }),
  biometric_or_camera: z.object({ uses: z.boolean(), details: z.string().max(2000).default("") }),
  other_advanced_tech: z.object({ uses: z.boolean(), details: z.string().max(2000).default("") }),
});

const bodySchema = z.object({
  org: z.object({
    name: z.string().min(1).max(200),
    country: z.string().min(2).max(2).default("ES"),
  }).optional(),
  interview: interviewSchema,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/audit
 *
 * Conversational onboarding endpoint. Takes a 6-question interview in plain
 * Spanish, infers the AI systems the business uses, classifies each under the
 * AI Act, and persists them in `ai_systems`.
 *
 * If `org` is included AND the user has no org yet, also creates the org.
 *
 * Returns:
 *  - org_id
 *  - ai_systems (array of inserted rows)
 *  - summary (executive summary in plain Spanish)
 */
export async function POST(request: Request) {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  // Find or create the user's org.
  let { data: org } = await sb.from("organizations").select("id, name, country").eq("owner_id", user.id).maybeSingle();
  if (!org) {
    if (!parsed.data.org) {
      return NextResponse.json({ error: "Org info required for first audit" }, { status: 400 });
    }
    const { data: created, error: orgErr } = await sb
      .from("organizations")
      .insert({ owner_id: user.id, name: parsed.data.org.name, country: parsed.data.org.country })
      .select("id, name, country")
      .single();
    if (orgErr || !created) return NextResponse.json({ error: orgErr?.message ?? "Org create failed" }, { status: 500 });
    org = created;
  }

  // Run the audit.
  let audit;
  try {
    audit = await auditBusiness({ name: org.name, country: org.country }, parsed.data.interview);
  } catch (err) {
    console.error("[audit] classifier failed:", err);
    return NextResponse.json(
      { org_id: org.id, ai_systems: [], summary: "", error: "Audit failed, retry later", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }

  // Insert detected systems in one batch.
  const inserted: Array<Record<string, unknown>> = [];
  if (audit.ai_systems.length > 0) {
    const rows = audit.ai_systems.map((s) => ({
      org_id: org.id,
      name: s.name,
      description: s.description,
      category: s.category,
      provider: s.provider,
      in_house: s.in_house,
      operates_on_personal_data: s.operates_on_personal_data,
      affects_individuals: s.affects_individuals,
      human_oversight: s.human_oversight,
      countries_of_operation: s.countries_of_operation,
      risk_classification: s.risk_tier,
      risk_reasoning: s.reasoning,
      obligations: { obligations: s.obligations, flagged_concerns: s.flagged_concerns },
      classified_at: new Date().toISOString(),
    }));
    const { data: ins, error: insErr } = await sb.from("ai_systems").insert(rows).select("*");
    if (insErr) {
      console.error("[audit] insert failed:", insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
    inserted.push(...(ins ?? []));
  }

  return NextResponse.json({
    org_id: org.id,
    ai_systems: inserted,
    summary: audit.summary,
    no_systems_found_explanation: audit.no_systems_found_explanation,
  });
}
