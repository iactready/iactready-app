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

interface AnswerResult {
  correct: boolean;
  correct_letter: string;
  explanation: string;
}

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

  const loadSession = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/study/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 20 }),
      });
      if (res.status === 401) { window.location.href = "/login?next=/study"; return; }
      if (res.status === 409) {
        const data = await res.json();
        if (data.error?.includes("Profile")) { window.location.href = "/start"; return; }
        setError(data.error || "Error");
        return;
      }
      if (res.status === 402) {
        const data = await res.json();
        setError(data.error || "Límite alcanzado");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando sesión");
      setQuestions(data.questions || []);
      setIsPaid(data.is_paid || false);
      setIndex(0);
      setStats({ correct: 0, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  async function submitAnswer() {
    if (!questions || !selected) return;
    const q = questions[index];
    setSubmitting(true);
    try {
      const res = await fetch("/api/study/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, selected_letter: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResult(data);
      setStats((s) => ({ correct: s.correct + (data.correct ? 1 : 0), total: s.total + 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
      setResult(null);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← Volver</Link>
        <div className="mt-12 rounded-lg border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="font-semibold text-red-200">{error}</h2>
          {error.includes("Límite") && (
            <Link href="/pricing" className="mt-4 inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-orange-400">
              Sube a Mensual →
            </Link>
          )}
        </div>
      </main>
    );
  }

  if (!questions) return <main className="p-6 text-center text-zinc-500">Cargando sesión...</main>;
  if (questions.length === 0) return <main className="p-6 text-center text-zinc-500">No hay preguntas disponibles.</main>;

  if (done) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <main className="min-h-screen p-6 max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← Inicio</Link>
        <div className="mt-12 text-center">
          <div className="text-6xl">🎯</div>
          <h1 className="mt-4 text-3xl font-bold">Sesión completada</h1>
          <p className="mt-2 text-zinc-400">Has acertado {stats.correct} de {stats.total} ({pct}%)</p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={loadSession} className="rounded-md bg-orange-500 px-4 py-2 font-medium text-zinc-950 hover:bg-orange-400">
              Otra sesión
            </button>
            <Link href="/" className="rounded-md border border-zinc-700 px-4 py-2 text-zinc-200 hover:bg-zinc-900">Salir</Link>
          </div>
          {!isPaid && (
            <p className="mt-6 text-xs text-zinc-500">¿Quieres más de 10 preguntas/día? <Link href="/pricing" className="underline">Mira los planes</Link>.</p>
          )}
        </div>
      </main>
    );
  }

  const q = questions[index];
  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← Salir</Link>
        <span className="text-xs text-zinc-500">{index + 1} / {questions.length} · ✓ {stats.correct}</span>
      </div>

      <div className="mt-6 inline-block rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
        Tema {q.topic.number}: {q.topic.title}
      </div>

      <h2 className="mt-4 text-xl font-medium leading-relaxed">{q.text}</h2>

      <div className="mt-6 space-y-2">
        {q.options.map((opt) => {
          const isCorrectAns = result && result.correct_letter === opt.letter;
          const isSelectedWrong = result && selected === opt.letter && !result.correct;
          return (
            <button
              key={opt.letter}
              disabled={!!result || submitting}
              onClick={() => setSelected(opt.letter)}
              className={`block w-full text-left rounded-md border p-3 transition-colors ${
                isCorrectAns ? "border-emerald-500 bg-emerald-500/10" :
                isSelectedWrong ? "border-red-500 bg-red-500/10" :
                selected === opt.letter ? "border-orange-500 bg-orange-500/10" :
                "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <span className="font-semibold mr-3">{opt.letter.toUpperCase()})</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {result && (
        <div className={`mt-5 rounded-md border p-4 ${result.correct ? "border-emerald-500/30 bg-emerald-500/5" : "border-orange-500/30 bg-orange-500/5"}`}>
          <p className="font-medium">{result.correct ? "✓ Correcta" : `✗ La correcta era la ${result.correct_letter.toUpperCase()}`}</p>
          <p className="mt-2 text-sm text-zinc-300">{result.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!result ? (
          <button onClick={submitAnswer} disabled={!selected || submitting}
            className="rounded-md bg-orange-500 px-6 py-2.5 font-medium text-zinc-950 hover:bg-orange-400 disabled:opacity-50">
            {submitting ? "..." : "Responder"}
          </button>
        ) : (
          <button onClick={next} className="rounded-md bg-orange-500 px-6 py-2.5 font-medium text-zinc-950 hover:bg-orange-400">
            {index + 1 >= questions.length ? "Terminar →" : "Siguiente →"}
          </button>
        )}
      </div>
    </main>
  );
}
