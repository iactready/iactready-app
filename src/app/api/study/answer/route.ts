import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  question_id: z.string().uuid(),
  selected_letter: z.enum(["a", "b", "c", "d"]),
  time_seconds: z.number().int().min(0).max(600).optional(),
});

/**
 * POST /api/study/answer
 *
 * Records the user's answer, returns whether it was correct + the explanation.
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

  // Load the question
  const { data: q } = await sb
    .from("o_question")
    .select("id, topic_id, correct_letter, explanation, options")
    .eq("id", parsed.data.question_id)
    .maybeSingle();
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const isCorrect = q.correct_letter === parsed.data.selected_letter;

  await sb.from("o_attempt").insert({
    user_id: user.id,
    question_id: q.id,
    topic_id: q.topic_id,
    selected_letter: parsed.data.selected_letter,
    is_correct: isCorrect,
    time_seconds: parsed.data.time_seconds,
    session_type: "daily",
  });

  // Update session aggregate stats
  const today = new Date().toISOString().slice(0, 10);
  const admin = getSupabaseAdminClient();
  const { data: sess } = await admin
    .from("o_session")
    .select("id, questions_count, correct_count, total_time_sec")
    .eq("user_id", user.id)
    .eq("session_date", today)
    .eq("session_type", "daily")
    .maybeSingle();
  if (sess) {
    await admin
      .from("o_session")
      .update({
        questions_count: sess.questions_count + 1,
        correct_count: sess.correct_count + (isCorrect ? 1 : 0),
        total_time_sec: sess.total_time_sec + (parsed.data.time_seconds ?? 0),
      })
      .eq("id", sess.id);
  }

  // Update streak
  const { data: profile } = await admin.from("o_profile").select("current_streak, longest_streak, last_session_at").eq("user_id", user.id).maybeSingle();
  if (profile) {
    const lastDay = profile.last_session_at ? new Date(profile.last_session_at).toISOString().slice(0, 10) : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak = profile.current_streak;
    if (lastDay !== today) {
      newStreak = lastDay === yesterday ? profile.current_streak + 1 : 1;
    }
    await admin
      .from("o_profile")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(profile.longest_streak, newStreak),
        last_session_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    correct: isCorrect,
    correct_letter: q.correct_letter,
    explanation: q.explanation,
  });
}
