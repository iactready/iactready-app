import { WaitlistForm } from "@/components/waitlist-form";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#0b0b0d] text-[#f4f4f5] grid grid-rows-[1fr_auto]">
      {/* Background grid + glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 -top-[10%] z-0 h-[60vw] max-h-[700px] w-[80vw] max-w-[900px] -translate-x-1/2 [background:radial-gradient(closest-side,rgba(249,115,22,0.18),transparent_70%)]"
      />

      <main className="relative z-10 mx-auto w-full max-w-[920px] px-6 py-20">
        <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 text-sm font-bold tracking-tight text-[#a0a0a8]">
          <span className="relative h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_12px_theme(colors.orange.500)] animate-pulse" />
          iActReady · llegando verano 2026
        </span>

        <h1 className="mt-8 mb-4 font-extrabold leading-[1.05] tracking-tight bg-gradient-to-b from-white to-[#c4c4c8] bg-clip-text text-transparent text-[clamp(36px,6vw,64px)]">
          Cumple con el AI&nbsp;Act{" "}
          <span className="bg-gradient-to-b from-orange-400 to-orange-500 bg-clip-text text-transparent">
            sin contratar una consultora
          </span>
          .
        </h1>

        <p className="max-w-[620px] mb-10 text-[#a0a0a8] text-[clamp(17px,2vw,20px)]">
          SaaS de compliance autoservicio para PYMEs europeas que usan inteligencia artificial.
          Te ayudamos a <strong className="text-[#f4f4f5] font-semibold">inventariar tus sistemas IA</strong>,{" "}
          <strong className="text-[#f4f4f5] font-semibold">generar la documentación obligatoria</strong> y{" "}
          <strong className="text-[#f4f4f5] font-semibold">cumplir el Reglamento Europeo de IA</strong> antes del 2 de
          agosto de 2026.
        </p>

        <section className="my-12 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <FeatureCard
            icon="📋"
            title="Inventario IA automático"
            body="Wizard de 5 minutos que clasifica tus sistemas IA por nivel de riesgo según el AI Act."
          />
          <FeatureCard
            icon="📄"
            title="Documentación generada"
            body="Política de uso, ficha de transparencia, plan de supervisión humana, evaluación de impacto. Exportable como PDF."
          />
          <FeatureCard
            icon="🎓"
            title="AI Literacy training"
            body="Micro-curso obligatorio (Art. 4 AI Act) personalizado por rol, con certificado descargable por empleado."
          />
          <FeatureCard
            icon="🔔"
            title="Alertas regulatorias"
            body="Monitorizamos AESIA, AEPD, EDPB y Comisión EU. Solo te avisamos de cambios que te afectan."
          />
        </section>

        <section className="my-8 rounded-[20px] border border-white/10 bg-[#131318] p-7">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#a0a0a8]">Cuenta atrás</div>
          <div className="flex flex-wrap items-baseline gap-3 text-lg leading-snug">
            <span className="text-[28px] font-extrabold tracking-tight text-orange-400">2 ago 2026</span>
            <span>
              Entrada plena del EU AI&nbsp;Act. Sanciones hasta{" "}
              <strong className="text-[#f4f4f5]">€35M o 7% facturación</strong>.
            </span>
          </div>
        </section>

        <h2 className="mt-12 mb-3 text-[22px] font-bold tracking-tight">Reserva tu plaza en la beta privada</h2>
        <p className="mb-4 max-w-[560px] text-[#a0a0a8]">
          Acceso anticipado, precio early-adopter y soporte 1:1 durante los primeros 3 meses. Cupos limitados a 25
          PYMEs.
        </p>

        <WaitlistForm />
      </main>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-[#a0a0a8]">
        <div className="mb-2 flex flex-wrap justify-center gap-6">
          <a href="https://linkedin.com/company/iactready" target="_blank" rel="noopener" className="hover:text-white">
            LinkedIn
          </a>
          <a href="https://x.com/iactready" target="_blank" rel="noopener" className="hover:text-white">
            X
          </a>
          <a href="https://github.com/iactready" target="_blank" rel="noopener" className="hover:text-white">
            GitHub
          </a>
          <a href="mailto:hola@iactready.com" className="hover:text-white">
            hola@iactready.com
          </a>
        </div>
        <div>© 2026 iActReady · Datos alojados en EU · Stack 100% europeo</div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#131318] p-6 transition hover:-translate-y-0.5 hover:border-orange-500/30">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="mb-1.5 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-[#a0a0a8]">{body}</p>
    </div>
  );
}
