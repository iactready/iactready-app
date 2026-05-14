import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { generateQuestionsForTopic, generateSyllabus } from "@/lib/opositor/generator";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min: this seeds 60 topics × 5 questions

const schema = z.object({
  oposicion_id: z.string(),
  admin_token: z.string(),
  /** If false, only generate syllabus (no questions). Useful for dry-run. */
  generate_questions: z.boolean().default(true),
  /** How many questions per topic. */
  questions_per_topic: z.number().int().min(1).max(20).default(5),
  /** Limit to first N topics (for testing). 0 = all. */
  topic_limit: z.number().int().min(0).default(0),
});

/**
 * POST /api/admin/opositor/seed
 *
 * Admin-only endpoint that generates the syllabus + questions for an oposición
 * via Claude and persists them. Run once per oposición.
 *
 * Auth: requires the ADMIN_SEED_TOKEN env var (rotate after use).
 */
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (!serverEnv.ADMIN_SEED_TOKEN || parsed.data.admin_token !== serverEnv.ADMIN_SEED_TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdminClient();

  // 1) Load oposición record
  const { data: oposicion, error: opErr } = await admin
    .from("o_oposicion")
    .select("*")
    .eq("id", parsed.data.oposicion_id)
    .maybeSingle();
  if (opErr || !oposicion) return NextResponse.json({ error: "Oposición not found" }, { status: 404 });

  // 2) Generate syllabus
  let syllabus;
  try {
    syllabus = await generateSyllabus(oposicion.name, oposicion.body, oposicion.level);
  } catch (err) {
    return NextResponse.json({ error: "Syllabus failed", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
  if (parsed.data.topic_limit > 0) syllabus = syllabus.slice(0, parsed.data.topic_limit);

  // 3) Upsert topics
  const topicRows = syllabus.map((t) => ({
    oposicion_id: parsed.data.oposicion_id,
    number: t.number,
    title: t.title,
    subject_area: t.subject_area,
    brief_summary: t.brief_summary,
  }));
  await admin.from("o_topic").delete().eq("oposicion_id", parsed.data.oposicion_id);
  const { data: topics, error: tErr } = await admin.from("o_topic").insert(topicRows).select("id, number, title, subject_area, brief_summary");
  if (tErr || !topics) return NextResponse.json({ error: tErr?.message ?? "Topic insert failed" }, { status: 500 });

  await admin.from("o_oposicion").update({ topic_count: topics.length }).eq("id", parsed.data.oposicion_id);

  if (!parsed.data.generate_questions) {
    return NextResponse.json({ ok: true, topics_inserted: topics.length, questions_inserted: 0, note: "Skipped questions per flag" });
  }

  // 4) Generate N questions per topic, in batches of 5 in parallel.
  const BATCH = 5;
  let totalQuestions = 0;
  const failures: Array<{ topic: number; error: string }> = [];

  for (let i = 0; i < topics.length; i += BATCH) {
    const batch = topics.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (topic) => {
        const seed = {
          number: topic.number,
          title: topic.title,
          subject_area: topic.subject_area ?? "",
          brief_summary: topic.brief_summary ?? "",
        };
        const qs = await generateQuestionsForTopic(seed, oposicion.name, parsed.data.questions_per_topic);
        const rows = qs.map((q) => ({
          topic_id: topic.id,
          question_text: q.question_text,
          options: q.options,
          correct_letter: q.correct_letter,
          explanation: q.explanation,
          difficulty: q.difficulty,
          source: "ai_generated",
        }));
        await admin.from("o_question").insert(rows);
        return rows.length;
      }),
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.status === "fulfilled") totalQuestions += r.value;
      else failures.push({ topic: batch[j].number, error: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    }
  }

  return NextResponse.json({
    ok: true,
    topics_inserted: topics.length,
    questions_inserted: totalQuestions,
    failures,
  });
}
