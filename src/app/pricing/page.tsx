"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(plan: PlanId) {
    setLoading(plan); setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) { window.location.href = "/login?next=/pricing"; return; }
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Error");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen px-6">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/70 border-b border-white/5 -mx-6 px-6 py-3 mb-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold">i</div>
            <span className="font-bold text-lg">iActReady</span>
          </Link>
          <Link href="/start" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-orange-400">Empezar gratis</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto pt-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-orange-400 text-sm font-medium tracking-wide uppercase">Precios</span>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">Empieza gratis. Sube cuando estés enganchado.</h1>
          <p className="mt-4 text-zinc-300">Sin permanencia. Cancelas con un click. IVA incluido.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {(["free", "monthly", "annual"] as PlanId[]).map((id) => {
            const plan = PLANS[id];
            const isPaid = id !== "free";
            const highlight = plan.highlight;
            return (
              <div key={id} className={`relative rounded-2xl border p-6 flex flex-col ${highlight ? "border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-transparent" : "border-white/10 bg-white/[0.02]"}`}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-zinc-950">Más popular</div>
                )}
                {id === "annual" && (
                  <div className="absolute -top-3 right-4 inline-block rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-300">-25%</div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-400 min-h-[3rem]">{plan.tagline}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight">€{plan.price_eur}</span>
                  {isPaid && <span className="text-zinc-400 text-sm">{plan.interval === "year" ? "/año" : "/mes"}</span>}
                </div>
                {id === "annual" && <p className="mt-1 text-xs text-zinc-500">Equivalente a €14.92/mes</p>}

                <ul className="mt-6 space-y-2.5 text-sm text-zinc-200 flex-1">
                  {plan.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2.5"><span className="shrink-0 text-orange-400 mt-0.5">✓</span><span>{b}</span></li>
                  ))}
                </ul>

                <div className="mt-7">
                  {isPaid ? (
                    <button onClick={() => start(id)} disabled={loading !== null || !plan.stripe_price_id}
                      className={`w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-50 transition-colors ${highlight ? "bg-orange-500 text-zinc-950 hover:bg-orange-400" : "border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"}`}>
                      {loading === id ? "Cargando..." : !plan.stripe_price_id ? "Próximamente" : "Suscribirme"}
                    </button>
                  ) : (
                    <Link href="/start" className="block w-full text-center rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-medium text-zinc-100 hover:bg-white/10">
                      Empezar gratis
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-6 text-center text-sm text-red-400">{error}</p>}

        <div className="mt-16 text-center text-sm text-zinc-400">
          <p>¿Tienes preguntas? <a href="mailto:hola@iactready.com" className="text-orange-300 hover:text-orange-200 underline">hola@iactready.com</a></p>
          <p className="mt-2 text-xs">Pago seguro con Stripe · Datos en EU</p>
        </div>
      </div>
    </main>
  );
}
