"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  topic: { id: string; number: number; title: string; area: string | null };
  text: string;
  options: Array<{ letter: "a" | "b" | "c" | "d"; text: string }>;
  difficulty: string;
}
interface AnswerResult { correct: boolean; correct_letter: string; explanation: string; }

export default function StudyPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [isPaid, setIsPaid] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const loadSession = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/study/session", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ count: 20 }),
      });
      if (res.status === 401) { window.location.href = "/login?next=/study"; return; }
      if (res.status === 409) {
        const data = await res.json();
        if (data.error?.includes("Profile")) { window.location.href = "/start"; return; }
        setError(data.error || "Error"); return;
      }
      if (res.status === 402) { const data = await res.json(); setError(data.error || "Límite alcanzado"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setQuestions(data.questions || []);
      setIsPaid(data.is_paid || false);
      setIndex(0); setStats({ correct: 0, total: 0 }); setDone(false); setStartTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);
  useEffect(() => { setStartTime(Date.now()); }, [index]);

  async function submitAnswer() {
    if (!questions || !selected) return;
    const q = questions[index];
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setSubmitting(true);
    try {
      const res = await fetch("/api/study/answer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, selected_letter: selected, time_seconds: elapsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResult(data);
      setStats((s) => ({ correct: s.correct + (data.correct ? 1 : 0), total: s.total + 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setSubmitting(false); }
  }

  function next() {
    if (!questions) return;
    if (index + 1 >= questions.length) { setDone(true); }
    else { setIndex(index + 1); setSelected(null); setResult(null); }
  }

  /* === error screen === */
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold">{error}</h2>
          {error.includes("Límite") && (
            <>
              <p className="mt-3 text-zinc-400">Has aprovechado las 10 preguntas gratis de hoy. Mañana puedes seguir, o desbloquea acceso ilimitado ahora.</p>
              <Link href="/pricing" className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-orange-400">Ver planes →</Link>
            </>
          )}
        </div>
      </main>
    );
  }
  if (!questions) {
    return <main className="min-h-screen flex items-center justify-center text-zinc-500"><div className="text-center"><div className="h-10 w-10 mx-auto rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin"></div><p className="mt-4">Preparando tus preguntas...</p></div></main>;
  }
  if (questions.length === 0) return <main className="p-6 text-center text-zinc-500">No hay preguntas disponibles ahora.</main>;

  /* === done screen === */
  if (done) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    const message = pct >= 80 ? "¡Brutal!" : pct >= 60 ? "Buen ritmo." : pct >= 40 ? "Vas avanzando." : "Hoy fue duro, mañana mejor.";
    return (
      <main className="min-h-screen flex flex-col">
        <StudyHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-center max-w-md fade-up">
            <div className="text-6xl mb-6">{pct >= 80 ? "🎯" : pct >= 60 ? "💪" : "📚"}</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{message}</h1>
            <p className="mt-2 text-zinc-400">Has completado tu sesión.</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-orange-400">{stats.correct}</span>
                <span className="text-2xl text-zinc-500">/ {stats.total}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{pct}% de acierto</p>
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <button onClick={loadSession} className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-zinc-950 hover:bg-orange-400">Otra sesión</button>
              <Link href="/" className="rounded-lg border border-white/15 px-6 py-3 text-zinc-200 hover:bg-white/5">Volver al inicio</Link>
            </div>
            {!isPaid && (
              <p className="mt-8 text-xs text-zinc-500">
                ¿Quieres más preguntas hoy? <Link href="/pricing" className="text-orange-300 underline">Sube a Mensual</Link> para acceso ilimitado.
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const q = questions[index];
  const progress = ((index + (result ? 1 : 0)) / questions.length) * 100;
  return (
    <main className="min-h-screen flex flex-col">
      <StudyHeader stats={stats} total={questions.length} current={index + 1} />
      <div className="px-6 py-1">
        <div className="max-w-2xl mx-auto h-1 rounded-full bg-white/10">
          <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-zinc-400">
            <span>Tema {q.topic.number}</span>
            <span className="text-zinc-600">·</span>
            <span>{q.topic.title}</span>
          </div>
          <h2 className="mt-5 text-xl md:text-2xl font-medium leading-relaxed text-zinc-100">{q.text}</h2>

          <div className="mt-8 space-y-2.5">
            {q.options.map((opt) => {
              const isCorrectAns = result && result.correct_letter === opt.letter;
              const isSelectedWrong = result && selected === opt.letter && !result.correct;
              const isSelected = selected === opt.letter;
              return (
                <button key={opt.letter} disabled={!!result || submitting} onClick={() => setSelected(opt.letter)}
                  className={`block w-full text-left rounded-xl border px-4 py-3.5 transition-all flex items-start gap-3 ${
                    isCorrectAns ? "border-emerald-500/50 bg-emerald-500/10" :
                    isSelectedWrong ? "border-red-500/50 bg-red-500/10" :
                    isSelected ? "border-orange-500 bg-orange-500/10" :
                    "border-white/10 hover:border-white/30 hover:bg-white/[0.03]"
                  }`}>
                  <span className={`shrink-0 grid place-items-center h-7 w-7 rounded-lg text-sm font-bold ${
                    isCorrectAns ? "bg-emerald-500 text-zinc-950" :
                    isSelectedWrong ? "bg-red-500 text-zinc-950" :
                    isSelected ? "bg-orange-500 text-zinc-950" :
                    "bg-white/10 text-zinc-300"
                  }`}>{opt.letter.toUpperCase()}</span>
                  <span className="text-zinc-200 leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {result && (
            <div className={`fade-up mt-6 rounded-xl border p-5 ${result.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
              <p className={`font-semibold ${result.correct ? "text-emerald-300" : "text-orange-300"}`}>
                {result.correct ? "✓ Correcta" : `✗ La correcta era la ${result.correct_letter.toUpperCase()}`}
              </p>
              <p className="mt-2 text-sm text-zinc-200 leading-relaxed">{result.explanation}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!result ? (
              <button onClick={submitAnswer} disabled={!selected || submitting}
                className="rounded-lg bg-orange-500 px-8 py-3 font-semibold text-zinc-950 hover:bg-orange-400 disabled:opacity-40 transition-colors">
                {submitting ? "..." : "Responder"}
              </button>
            ) : (
              <button onClick={next} className="rounded-lg bg-orange-500 px-8 py-3 font-semibold text-zinc-950 hover:bg-orange-400">
                {index + 1 >= questions.length ? "Terminar →" : "Siguiente →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StudyHeader({ stats, total, current }: { stats?: { correct: number; total: number }; total?: number; current?: number }) {
  return (
    <header className="px-6 py-3 border-b border-white/5">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold text-sm">i</div>
          <span className="font-bold">iActReady</span>
        </Link>
        {total && current && (
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>{current} / {total}</span>
            {stats && stats.total > 0 && <span className="text-emerald-400">✓ {stats.correct}</span>}
          </div>
        )}
      </div>
    </header>
  );
}
