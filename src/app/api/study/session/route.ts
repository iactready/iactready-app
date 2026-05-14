import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  count: z.number().int().min(1).max(50).default(20),
  /** Optional topic id to focus on (otherwise mixed). */
  topic_id: z.string().uuid().optional(),
});

/**
 * POST /api/study/session
 *
 * Returns N questions for the user, prioritising:
 *   1. Topics they have not seen recently
 *   2. Questions they answered wrong before (spaced repetition)
 *   3. Random fill from their oposición catalog
 *
 * Honours plan limits:
 *   - Free: hard cap at 10 questions/day across all sessions.
 *   - Paid: unlimited.
 */
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

  // Profile
  const { data: profile } = await sb.from("o_profile").select("*").eq("user_id", user.id).maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile required — complete /start first" }, { status: 409 });

  // Plan
  const { data: sub } = await sb.from("o_subscription").select("plan, status").eq("user_id", user.id).maybeSingle();
  const isPaid = sub?.plan === "monthly" || sub?.plan === "annual";

  // Free user: 10/day total.
  let count = parsed.data.count;
  if (!isPaid) {
    const today = new Date().toISOString().slice(0, 10);
    const { count: alreadyToday } = await sb
      .from("o_attempt")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("attempted_at", `${today}T00:00:00Z`);
    const remaining = Math.max(0, 10 - (alreadyToday ?? 0));
    if (remaining <= 0) {
      return NextResponse.json({ error: "Daily free limit reached (10). Sube a Mensual para ilimitado.", upgrade_url: "/pricing" }, { status: 402 });
    }
    count = Math.min(count, remaining);
  }

  // Fetch IDs of questions the user has answered correctly (skip these).
  const { data: correctAttempts } = await sb
    .from("o_attempt")
    .select("question_id")
    .eq("user_id", user.id)
    .eq("is_correct", true);
  const seenCorrect = new Set((correctAttempts ?? []).map((a: { question_id: string }) => a.question_id));

  // First fetch all topic IDs for this oposición.
  const { data: topicsForOpos } = await sb.from("o_topic")
    .select("id, number, title, subject_area")
    .eq("oposicion_id", profile.oposicion_id);
  type TopicRow = { id: string; number: number; title: string; subject_area: string | null };
  const topics = (topicsForOpos ?? []) as TopicRow[];
  const topicById = new Map(topics.map((t) => [t.id, t]));
  const topicIds = topics.map((t) => t.id);
  if (topicIds.length === 0) {
    return NextResponse.json({ error: "Esta oposición no tiene temas cargados aún. Vuelve pronto." }, { status: 409 });
  }

  // Build pool: questions in those topics, excluding seen-correct.
  let queryBuilder = sb
    .from("o_question")
    .select("id, topic_id, question_text, options, difficulty")
    .in("topic_id", topicIds);
  if (parsed.data.topic_id) queryBuilder = queryBuilder.eq("topic_id", parsed.data.topic_id);

  const { data: pool, error: poolErr } = await queryBuilder.limit(500);
  if (poolErr) return NextResponse.json({ error: poolErr.message }, { status: 500 });

  type QRow = { id: string; topic_id: string; question_text: string; options: unknown; difficulty: string };
  const candidates = ((pool ?? []) as QRow[]).filter((q) => !seenCorrect.has(q.id));
  if (candidates.length === 0) {
    return NextResponse.json({ error: "No hay más preguntas disponibles. Vuelve mañana o pide más al admin." }, { status: 409 });
  }

  // Shuffle + take N
  const shuffled = candidates.sort(() => Math.random() - 0.5).slice(0, count);

  // Create session row to group attempts
  const admin = getSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: session } = await admin
    .from("o_session")
    .upsert({ user_id: user.id, session_date: today, session_type: "daily" }, { onConflict: "user_id,session_date,session_type" })
    .select("id")
    .single();

  return NextResponse.json({
    session_id: session?.id,
    is_paid: isPaid,
    questions: shuffled.map((q) => {
      const t = topicById.get(q.topic_id);
      return {
        id: q.id,
        topic: { id: q.topic_id, number: t?.number ?? 0, title: t?.title ?? "", area: t?.subject_area ?? null },
        text: q.question_text,
        options: q.options,
        difficulty: q.difficulty,
      };
    }),
  });
}
