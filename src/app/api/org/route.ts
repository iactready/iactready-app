import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  legal_name: z.string().nullish(),
  tax_id: z.string().nullish(),
  country: z.string().min(2).max(2).default("ES"),
  sector: z.string().nullish(),
  employee_range: z.enum(["1-10", "11-50", "51-250", "251-1000", "1000+"]).nullish(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/org — current users org, or 404 if not yet created. */
export async function GET() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await sb.from("organizations").select("*").eq("owner_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

/** POST /api/org — create the users org (MVP: one org per user). */
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

  // Already exists?
  const { data: existing } = await sb.from("organizations").select("id").eq("owner_id", user.id).maybeSingle();
  if (existing) return NextResponse.json({ error: "Organization already exists", id: existing.id }, { status: 409 });

  const { data, error } = await sb
    .from("organizations")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      legal_name: parsed.data.legal_name ?? null,
      tax_id: parsed.data.tax_id ?? null,
      country: parsed.data.country,
      sector: parsed.data.sector ?? null,
      employee_range: parsed.data.employee_range ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
