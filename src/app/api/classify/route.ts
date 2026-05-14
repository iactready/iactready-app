import { NextResponse } from "next/server";
import { z } from "zod";
import { classifyAiSystem } from "@/lib/classifier";

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(4000),
  category: z.string().nullish(),
  provider: z.string().nullish(),
  in_house: z.boolean(),
  operates_on_personal_data: z.boolean(),
  affects_individuals: z.boolean(),
  human_oversight: z.string().nullish(),
  countries_of_operation: z.array(z.string()).nullish(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/classify
 *
 * Stateless classifier. Takes an AI-system description, returns risk tier +
 * reasoning + obligations under EU AI Act. No persistence, no auth.
 *
 * Used internally by /api/inventory (with persistence) and exposed standalone
 * for the public "5-minute audit" landing flow.
 */
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
  }

  try {
    const result = await classifyAiSystem({
      ...parsed.data,
      category: parsed.data.category ?? null,
      provider: parsed.data.provider ?? null,
      human_oversight: parsed.data.human_oversight ?? null,
      countries_of_operation: parsed.data.countries_of_operation ?? null,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[classify]", err);
    return NextResponse.json(
      { error: "Classifier failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
