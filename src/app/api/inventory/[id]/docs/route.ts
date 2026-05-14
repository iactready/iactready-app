import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";
import { applicableDocs, DOC_CATALOG, type DocType } from "@/lib/docs/catalog";
import { generateDocument } from "@/lib/docs/generator";
import { userHasFeature } from "@/lib/billing/gate";
import type { RiskTier } from "@/lib/classifier";

const generateSchema = z.object({
  doc_type: z.string(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/inventory/[id]/docs
 *
 * Returns the catalog of documents applicable to this AI system, with the
 * generation status (already_generated true/false + last version metadata).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: system, error: sysErr } = await sb
    .from("ai_systems")
    .select("id, name, description, category, provider, in_house, operates_on_personal_data, affects_individuals, human_oversight, risk_classification")
    .eq("id", id)
    .maybeSingle();
  if (sysErr || !system) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const applicable = applicableDocs({
    risk_tier: system.risk_classification as RiskTier,
    in_house: system.in_house,
    operates_on_personal_data: system.operates_on_personal_data,
  });

  // Fetch already-generated current versions
  const { data: existingDocs } = await sb
    .from("documents")
    .select("id, doc_type, title, version, generated_at, content_hash")
    .eq("ai_system_id", id)
    .is("superseded_by", null);
  type DocRow = { id: string; doc_type: string; title: string; version: number; generated_at: string; content_hash: string };
  const existingByType = new Map<string, DocRow>();
  for (const d of (existingDocs ?? []) as DocRow[]) existingByType.set(d.doc_type, d);

  const canDownload = await userHasFeature("download_docs");

  return NextResponse.json({
    can_download: canDownload,
    docs: applicable.map((spec) => {
      const existing = existingByType.get(spec.id);
      return {
        doc_type: spec.id,
        title: spec.title,
        description: spec.description,
        citation: spec.citation,
        approx_pages: spec.approx_pages,
        generated: !!existing,
        version: existing?.version ?? null,
        generated_at: existing?.generated_at ?? null,
        id: existing?.id ?? null,
      };
    }),
  });
}

/**
 * POST /api/inventory/[id]/docs
 * Body: { doc_type: DocType }
 *
 * Generates the requested document for this AI system. Paywalled: requires the
 * `download_docs` feature (Autónomo plan or higher).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const canDownload = await userHasFeature("download_docs");
  if (!canDownload) {
    return NextResponse.json(
      { error: "Sube a un plan de pago para generar documentos", upgrade_url: "/pricing" },
      { status: 402 },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const docType = parsed.data.doc_type as DocType;
  if (!DOC_CATALOG[docType]) return NextResponse.json({ error: "Unknown doc_type" }, { status: 400 });

  // Load the AI system + parent org
  const { data: system } = await sb
    .from("ai_systems")
    .select("*, organizations(name, legal_name, country, sector)")
    .eq("id", id)
    .maybeSingle();
  if (!system) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const org = system.organizations as { name: string; legal_name?: string | null; country: string; sector?: string | null };

  // Generate via Claude
  let output;
  try {
    output = await generateDocument(docType, {
      org: { name: org.name, legal_name: org.legal_name, country: org.country, sector: org.sector },
      system: {
        name: system.name,
        description: system.description ?? "",
        category: system.category,
        provider: system.provider,
        in_house: system.in_house,
        operates_on_personal_data: system.operates_on_personal_data,
        affects_individuals: system.affects_individuals,
        human_oversight: system.human_oversight,
        risk_tier: system.risk_classification as RiskTier,
      },
    });
  } catch (err) {
    console.error("[docs] generation failed:", err);
    return NextResponse.json({ error: "Generation failed", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  // Supersede previous version (if any)
  const admin = getSupabaseAdminClient();
  const { data: prev } = await admin
    .from("documents")
    .select("id, version")
    .eq("ai_system_id", id)
    .eq("doc_type", docType)
    .is("superseded_by", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (prev?.version ?? 0) + 1;
  const { data: inserted, error: insErr } = await admin
    .from("documents")
    .insert({
      org_id: system.org_id,
      ai_system_id: id,
      doc_type: docType,
      title: output.title,
      content_md: output.content_md,
      content_hash: output.content_hash,
      version: nextVersion,
    })
    .select("id, doc_type, title, version, generated_at")
    .single();
  if (insErr || !inserted) return NextResponse.json({ error: insErr?.message ?? "Insert failed" }, { status: 500 });
  if (prev) {
    await admin.from("documents").update({ superseded_by: inserted.id }).eq("id", prev.id);
  }

  return NextResponse.json({
    id: inserted.id,
    doc_type: inserted.doc_type,
    title: inserted.title,
    version: inserted.version,
    generated_at: inserted.generated_at,
  });
}
