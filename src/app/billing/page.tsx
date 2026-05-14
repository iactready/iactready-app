import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { ManagePortalButton } from "./manage-portal-button";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  active: "Activa", trialing: "Prueba", past_due: "Pago atrasado",
  canceled: "Cancelada", incomplete: "Incompleta", unpaid: "Sin pago",
};

export default async function BillingPage() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await sb.from("o_subscription")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", user.id).maybeSingle();

  const planId: PlanId = ((sub?.plan as PlanId | null) ?? "free");
  const plan = PLANS[planId];
  const status = sub?.status ?? "active";
  const endsAt = sub?.current_period_end ? new Date(sub.current_period_end) : null;
  const hasStripe = !!sub?.stripe_customer_id;

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href="/study" className="text-sm text-zinc-400 hover:text-zinc-100">← Estudiar</Link>
      <h1 className="mt-4 text-3xl font-bold">Suscripción</h1>

      <section className="mt-8 rounded-lg border border-zinc-800 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Plan actual</p>
            <h2 className="mt-1 text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {planId === "free" ? "Gratis" : `€${plan.price_eur}${plan.interval === "year" ? "/año" : "/mes"} · ${STATUS_LABEL[status] ?? status}`}
            </p>
            {endsAt && (
              <p className="mt-2 text-xs text-zinc-500">
                {sub?.cancel_at_period_end ? `Se cancelará el ${endsAt.toLocaleDateString("es-ES")}` : `Próxima factura: ${endsAt.toLocaleDateString("es-ES")}`}
              </p>
            )}
          </div>
          <div className="shrink-0">
            {hasStripe ? <ManagePortalButton /> : <Link href="/pricing" className="inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-orange-400">Ver planes</Link>}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-zinc-300">Qué incluye tu plan</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-300">
          {plan.bullets.map((b, i) => <li key={i} className="flex gap-2"><span className="text-orange-400">✓</span><span>{b}</span></li>)}
        </ul>
      </section>

      {planId === "free" && (
        <section className="mt-8 rounded-lg border border-orange-500/30 bg-orange-500/5 p-5">
          <h3 className="font-semibold text-orange-200">Sube de plan</h3>
          <p className="mt-1 text-sm text-orange-200/80">Estás estudiando con 10 preguntas/día. Sube a Mensual para preguntas ilimitadas + simulacros + plan adaptativo.</p>
          <Link href="/pricing" className="mt-3 inline-block text-sm font-medium text-orange-300 hover:text-orange-200 underline">Ver planes →</Link>
        </section>
      )}
    </main>
  );
}
