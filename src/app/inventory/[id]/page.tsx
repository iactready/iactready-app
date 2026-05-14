import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Obligation { article: string; title: string; summary: string; deadline?: string }
interface ObligationsBlob { obligations?: Obligation[]; flagged_concerns?: string[] }

const TIER_INFO: Record<string, { label: string; color: string; summary: string }> = {
  prohibited: { label: "Prohibido", color: "bg-red-500/15 text-red-300 border-red-500/30", summary: "Uso prohibido por el Art. 5 del AI Act. Vigente desde 2 feb 2025." },
  high: { label: "Alto riesgo", color: "bg-orange-500/15 text-orange-300 border-orange-500/30", summary: "Sistema de alto riesgo (Art. 6 + Anexo III). Obligaciones plenas aplicables el 2 ago 2026." },
  limited: { label: "Transparencia", color: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30", summary: "Riesgo limitado (Art. 50). Obligaciones de transparencia aplicables el 2 ago 2026." },
  minimal: { label: "Mínimo", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", summary: "Riesgo mínimo. Sin obligaciones específicas más allá del Art. 4 (AI literacy)." },
  unclassified: { label: "Sin clasificar", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30", summary: "La clasificación está pendiente. Pulsa reclasificar." },
};

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: s } = await sb.from("ai_systems").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();

  const tier = TIER_INFO[s.risk_classification] ?? TIER_INFO.unclassified;
  const ob = (s.obligations as ObligationsBlob | null) ?? {};
  const obligations = ob.obligations ?? [];
  const concerns = ob.flagged_concerns ?? [];

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href="/inventory" className="text-sm text-zinc-400 hover:text-zinc-200">← Inventario</Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{s.name}</h1>
          <p className="mt-1 text-zinc-400">{[s.category, s.provider].filter(Boolean).join(" · ") || "Sin metadatos"}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${tier.color}`}>{tier.label}</span>
      </div>

      <p className="mt-4 text-zinc-300 whitespace-pre-wrap">{s.description}</p>

      <section className="mt-8 rounded-lg border border-zinc-800 p-5">
        <h2 className="text-lg font-semibold">Clasificación AI Act</h2>
        <p className="mt-1 text-sm text-zinc-400">{tier.summary}</p>
        {s.risk_reasoning && (
          <div className="mt-4 rounded-md bg-zinc-900/50 p-4 text-sm text-zinc-200 whitespace-pre-wrap">{s.risk_reasoning}</div>
        )}
      </section>

      {obligations.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Obligaciones aplicables</h2>
          <ul className="mt-3 space-y-3">
            {obligations.map((o, i) => (
              <li key={i} className="rounded-lg border border-zinc-800 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-medium text-zinc-100">{o.article} · {o.title}</h3>
                  {o.deadline && <span className="text-xs text-zinc-500">{o.deadline}</span>}
                </div>
                <p className="mt-1 text-sm text-zinc-300">{o.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {concerns.length > 0 && (
        <section className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h2 className="text-sm font-medium text-yellow-200">Preguntas para revisar</h2>
          <ul className="mt-2 space-y-1 text-sm text-yellow-100/90 list-disc list-inside">
            {concerns.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>
      )}
    </main>
  );
}
