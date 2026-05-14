import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  prohibited: { label: "Prohibido", color: "bg-red-500/15 text-red-300 border-red-500/30" },
  high: { label: "Alto riesgo", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  limited: { label: "Transparencia", color: "bg-yellow-500/15 text-yellow-200 border-yellow-500/30" },
  minimal: { label: "Mínimo", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  unclassified: { label: "Sin clasificar", color: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30" },
};

export default async function InventoryPage() {
  const sb = await getSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const { data: org } = await sb.from("organizations").select("id, name").eq("owner_id", user.id).maybeSingle();
  if (!org) redirect("/onboarding");

  const { data: systems } = await sb
    .from("ai_systems")
    .select("id, name, category, provider, risk_classification, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-400">{org.name}</p>
          <h1 className="text-3xl font-bold">Inventario de sistemas IA</h1>
        </div>
        <Link href="/inventory/new" className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-orange-400">
          + Añadir sistema
        </Link>
      </div>

      {!systems || systems.length === 0 ? (
        <div className="mt-12 rounded-lg border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-300">Todavía no has registrado ningún sistema IA.</p>
          <Link href="/inventory/new" className="mt-4 inline-block rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-orange-400">
            Empezar el inventario
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {systems.map((s) => {
            const tier = TIER_LABEL[s.risk_classification] ?? TIER_LABEL.unclassified;
            return (
              <li key={s.id}>
                <Link href={`/inventory/${s.id}`} className="block rounded-lg border border-zinc-800 hover:border-zinc-600 p-4 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-zinc-100 truncate">{s.name}</h3>
                      <p className="mt-1 text-sm text-zinc-400 truncate">
                        {[s.category, s.provider].filter(Boolean).join(" · ") || "Sin categoría"}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
