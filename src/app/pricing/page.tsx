"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/billing/plans";

const PAID: PlanId[] = ["monthly", "annual"];

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(plan: PlanId) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <header className="text-center pt-12">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100">← iActReady</Link>
        <h1 className="mt-6 text-4xl font-bold">Planes y precios</h1>
        <p className="mt-3 text-zinc-400">Empieza gratis. Sube cuando estés enganchado.</p>
      </header>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["free", ...PAID] as PlanId[]).map((id) => {
          const plan = PLANS[id];
          const isPaid = id !== "free";
          const highlight = plan.highlight;
          return (
            <div key={id} className={`rounded-lg border p-6 flex flex-col ${highlight ? "border-orange-500 bg-orange-500/5" : "border-zinc-800"}`}>
              {highlight && <div className="mb-3 -mt-1 inline-block self-start rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-zinc-950">Más popular</div>}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-400 min-h-[3rem]">{plan.tagline}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold">€{plan.price_eur}</span>
                {isPaid && <span className="text-zinc-400">{plan.interval === "year" ? "/año" : "/mes"}</span>}
              </div>
              <ul className="mt-5 space-y-2 text-sm text-zinc-300 flex-1">
                {plan.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2"><span className="text-orange-400 shrink-0">✓</span><span>{b}</span></li>
                ))}
              </ul>
              <div className="mt-6">
                {isPaid ? (
                  <button onClick={() => start(id)} disabled={loading !== null || !plan.stripe_price_id}
                    className={`w-full rounded-md px-4 py-2.5 font-medium disabled:opacity-50 ${highlight ? "bg-orange-500 text-zinc-950 hover:bg-orange-400" : "border border-zinc-700 text-zinc-200 hover:bg-zinc-900"}`}>
                    {loading === id ? "Cargando..." : !plan.stripe_price_id ? "Próximamente" : "Suscribirme"}
                  </button>
                ) : (
                  <Link href="/start" className="block w-full text-center rounded-md border border-zinc-700 px-4 py-2.5 font-medium text-zinc-200 hover:bg-zinc-900">
                    Empezar gratis
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-6 text-center text-sm text-red-400">{error}</p>}
      <p className="mt-12 text-center text-xs text-zinc-500">IVA incluido · Cancelas cuando quieras · Pago seguro con Stripe</p>
    </main>
  );
}
