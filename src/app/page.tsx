import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <BoeBar />
      <UseCases />
      <ProductTour />
      <Pipeline />
      <FeaturesBento />
      <Testimonials />
      <Comparison />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

/* ─────────────── HEADER ─────────────── */
function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/60 border-b border-white/5">
      <div className="px-6 py-3 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-zinc-950 font-bold text-lg shadow-lg shadow-orange-500/20">i</div>
          <span className="font-bold text-lg tracking-tight">iActReady</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
          <a href="#producto" className="hover:text-white transition-colors">Producto</a>
          <a href="#oposiciones" className="hover:text-white transition-colors">Oposiciones</a>
          <a href="#precios" className="hover:text-white transition-colors">Precios</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
        </nav>
        <Link href="/start" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-orange-400 transition-all hover:shadow-lg hover:shadow-orange-500/30">
          Empezar gratis
        </Link>
      </div>
    </header>
  );
}

/* ─────────────── HERO ─────────────── */
function Hero() {
  return (
    <section className="relative px-6 pt-24 pb-12 md:pt-36 md:pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="fade-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-md shadow-orange-400/50 animate-pulse"></span>
            Aux. Administrativo del Estado disponible · Más oposiciones llegando
          </div>
          <h1 className="fade-up-1 mt-7 text-[2.75rem] md:text-7xl lg:text-[5.25rem] font-bold leading-[1.02] tracking-[-0.03em]">
            <span className="text-gradient-fade">La IA que estudia</span><br/>
            <span className="text-gradient-fade">contigo cada día,</span><br/>
            <span className="text-gradient-warm">hasta aprobar.</span>
          </h1>
          <p className="fade-up-2 mt-9 text-lg md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed font-light">
            Plan adaptativo, 20 preguntas al día con explicación, simulacros oficiales. <span className="text-white font-medium">Una academia presencial cuesta €1.500-3.000 al año. iActReady, €240.</span>
          </p>
          <div className="fade-up-3 mt-11 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/start" className="group rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-7 py-4 font-semibold text-zinc-950 hover:from-orange-300 hover:to-orange-400 transition-all hover:shadow-2xl hover:shadow-orange-500/40 flex items-center gap-2">
              Empezar gratis
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a href="#producto" className="rounded-xl glass-strong px-7 py-4 font-medium text-zinc-100 hover:bg-white/10 transition-all">
              Cómo funciona ↓
            </a>
          </div>
          <p className="fade-up-3 mt-5 text-xs text-zinc-500">
            10 preguntas gratis cada día · Sin tarjeta · Cancelas cuando quieras
          </p>
        </div>

        {/* Big product mockup */}
        <div className="fade-up-4 mt-16 md:mt-24 max-w-4xl mx-auto">
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}

function ProductMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-32 -inset-y-12 bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-purple-500/10 blur-3xl pointer-events-none"></div>
      <div className="relative rounded-3xl glass-strong shadow-2xl shadow-black/40 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60"></span>
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/60"></span>
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-xs text-zinc-500">app.iactready.com/study</div>
        </div>
        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-5">
            <span>Sesión de hoy · 7/20</span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-400 font-medium">✓ 5 correctas</span>
              <span className="flex items-center gap-1.5 text-orange-300 font-medium">🔥 12 días seguidos</span>
            </div>
          </div>
          <div className="h-1 rounded-full bg-white/10 mb-6">
            <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" style={{width:'35%'}}></div>
          </div>
          <div className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-zinc-400 mb-5">
            Tema 5 · El Gobierno
          </div>
          <h3 className="text-lg md:text-2xl font-medium leading-relaxed">
            Según el artículo 99.1 de la Constitución Española, ¿quién propone al candidato a Presidente del Gobierno para su investidura?
          </h3>
          <div className="mt-6 space-y-2.5">
            <Option letter="a" text="El Presidente del Congreso de los Diputados" />
            <Option letter="b" text="El Rey, previa consulta con los grupos parlamentarios" highlight />
            <Option letter="c" text="El Presidente del Senado" />
            <Option letter="d" text="El candidato por iniciativa propia" />
          </div>
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <p className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <span className="grid place-items-center h-5 w-5 rounded-full bg-emerald-500 text-zinc-950 text-xs">✓</span>
              Correcta
            </p>
            <p className="mt-2.5 text-sm text-zinc-200 leading-relaxed">
              El Rey propone candidato tras consultar con los grupos con representación parlamentaria <span className="text-emerald-300">(Art. 99.1 CE)</span>. Las a y c son incorrectas porque no es competencia de los presidentes de las cámaras. La d no procede en nuestro sistema parlamentario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Option({ letter, text, highlight }: { letter: string; text: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-3.5 ${highlight ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/[0.02]"}`}>
      <span className={`shrink-0 grid place-items-center h-7 w-7 rounded-lg text-xs font-bold ${highlight ? "bg-emerald-500 text-zinc-950" : "bg-white/10 text-zinc-300"}`}>{letter.toUpperCase()}</span>
      <span className="text-sm md:text-base text-zinc-200">{text}</span>
    </div>
  );
}

/* ─────────────── BOE BAR ─────────────── */
function BoeBar() {
  return (
    <section className="px-6 py-12 md:py-16 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mb-8">Anclado en fuentes oficiales</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 items-center">
          <Pillar text="BOE — Temario oficial" />
          <Pillar text="Constitución Española" />
          <Pillar text="Ley 39/2015 PAC" />
          <Pillar text="EBEP — Estatuto Básico" />
        </div>
      </div>
    </section>
  );
}
function Pillar({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
      <span className="text-zinc-600">▣</span>
      <span>{text}</span>
    </div>
  );
}

/* ─────────────── USE CASES ─────────────── */
function UseCases() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Para quién</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
          Cuatro perfiles, <span className="text-gradient-warm">un mismo método.</span>
        </h2>
        <p className="mt-4 text-zinc-400 text-lg max-w-2xl">
          El plan se adapta a tu situación. No importa si empiezas o si llevas años.
        </p>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Persona emoji="🌱" name="Recién decidido" desc="Acabas de elegir oposición. Te diagnosticamos y trazamos un plan desde cero adaptado a tu fecha objetivo." accent="orange" />
          <Persona emoji="📖" name="Con academia" desc="Ya estudias con manuales o academia. Usas iActReady como banco de preguntas activo para practicar a diario." accent="amber" />
          <Persona emoji="⏰" name="Con poco tiempo" desc="Trabajas o estudias. Te organizamos sesiones de 15-20 minutos efectivas, donde sea, cuando puedas." accent="purple" />
          <Persona emoji="🎯" name="Cerca del examen" desc="Falta poco. Simulacros cronometrados + repaso intensivo de tus temas flojos hasta el día D." accent="rose" />
        </div>
      </div>
    </section>
  );
}
function Persona({ emoji, name, desc, accent }: { emoji: string; name: string; desc: string; accent: "orange"|"amber"|"purple"|"rose" }) {
  const color = { orange: "from-orange-500/20", amber: "from-amber-500/20", purple: "from-purple-500/20", rose: "from-rose-500/20" }[accent];
  return (
    <div className={`group relative rounded-2xl border border-white/10 bg-gradient-to-b ${color} to-transparent p-6 hover:border-white/20 transition-all`}>
      <div className="text-4xl">{emoji}</div>
      <h3 className="mt-5 font-semibold text-lg">{name}</h3>
      <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────── PRODUCT TOUR ─────────────── */
function ProductTour() {
  return (
    <section id="producto" className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Cómo funciona</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          De cero a aprobar en <span className="text-gradient-warm">tres pasos diarios</span>.
        </h2>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TourStep
            num="01"
            title="Eliges tu nivel"
            description="En 60 segundos diagnosticamos qué temas dominas y cuáles tienes flojos. Tu plan se construye solo, adaptado a tu fecha de examen."
            mockup={<StepMockupOnboarding />}
          />
          <TourStep
            num="02"
            title="Estudias 20 preguntas"
            description="Cada día, 20 preguntas tuyas: 60% en tus puntos flojos, 40% repaso espaciado. Texto, móvil, web — donde te pille."
            mockup={<StepMockupStudy />}
          />
          <TourStep
            num="03"
            title="Aprendes con cada error"
            description="Cada respuesta lleva una explicación clara con cita al artículo del BOE. No vuelves a confundirte porque entiendes el porqué."
            mockup={<StepMockupExplain />}
          />
        </div>
      </div>
    </section>
  );
}
function TourStep({ num, title, description, mockup }: { num: string; title: string; description: string; mockup: React.ReactNode }) {
  return (
    <div className="rounded-2xl glass p-6 flex flex-col">
      <div className="flex items-baseline justify-between">
        <span className="text-orange-400 font-mono text-sm font-semibold">{num}</span>
      </div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-6">{mockup}</div>
    </div>
  );
}
function StepMockupOnboarding() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-xs space-y-2">
      <div className="text-zinc-500">Paso 3/3</div>
      <div className="h-1 rounded-full bg-white/10"><div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 w-full"></div></div>
      <div className="mt-3 font-medium text-zinc-200">¿En qué punto estás?</div>
      <div className="rounded-md border border-orange-500 bg-orange-500/10 px-3 py-2 text-zinc-100">🌱 Empiezo de cero</div>
      <div className="rounded-md border border-white/10 px-3 py-2 text-zinc-500">📖 Llevo un año o menos</div>
      <div className="rounded-md border border-white/10 px-3 py-2 text-zinc-500">🎯 Más de un año</div>
    </div>
  );
}
function StepMockupStudy() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 text-xs space-y-2">
      <div className="flex justify-between text-zinc-500"><span>7/20</span><span className="text-orange-300">🔥 12d</span></div>
      <div className="text-zinc-300 font-medium">¿Quién propone al candidato a Presidente del Gobierno?</div>
      <div className="space-y-1.5">
        <div className="rounded-md bg-white/5 px-2.5 py-1.5 text-zinc-400">a) El Presidente del Congreso</div>
        <div className="rounded-md border border-orange-500/60 bg-orange-500/10 px-2.5 py-1.5 text-zinc-100">b) El Rey, previa consulta</div>
        <div className="rounded-md bg-white/5 px-2.5 py-1.5 text-zinc-400">c) El Presidente del Senado</div>
      </div>
    </div>
  );
}
function StepMockupExplain() {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-2">
      <div className="text-emerald-300 font-semibold">✓ Correcta</div>
      <p className="text-zinc-300 leading-relaxed">El Rey propone candidato tras consultar con los grupos parlamentarios <span className="text-emerald-300 font-medium">(Art. 99.1 CE)</span>. Las opciones a y c no son competencia del presidente de las cámaras.</p>
    </div>
  );
}

/* ─────────────── PIPELINE (transparency) ─────────────── */
function Pipeline() {
  return (
    <section className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Transparencia</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          De dónde salen <span className="text-gradient-cool">tus preguntas</span>.
        </h2>
        <p className="mt-4 text-zinc-400 text-lg max-w-2xl">
          Sin caja negra. Cada pregunta tiene fuente legal y revisión humana en caso de error reportado.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-3">
          <PipelineStep num="1" title="Temario oficial BOE" desc="Importamos los 26 temas oficiales de la convocatoria publicada en el BOE." />
          <PipelineStep num="2" title="Claude Sonnet 4.5" desc="Un modelo IA estado-del-arte redacta preguntas tipo test sobre cada tema." />
          <PipelineStep num="3" title="Cita al artículo" desc="Cada pregunta queda ligada al artículo legal correspondiente: CE, Ley 39/2015, EBEP." />
          <PipelineStep num="4" title="Reporte humano" desc="Si detectas un error, lo corregimos en 24h y avisamos a quien le apareció." />
        </div>
      </div>
    </section>
  );
}
function PipelineStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl glass p-5">
      <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold text-sm">{num}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────── FEATURES BENTO ─────────────── */
function FeaturesBento() {
  return (
    <section className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Lo que incluye</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
          Todo lo que necesitas. <span className="text-zinc-500">Nada de relleno.</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Big card */}
          <div className="md:col-span-2 rounded-3xl glass p-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl"></div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-medium text-orange-300">
                🎯 El motor
              </div>
              <h3 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight">Plan adaptativo que aprende contigo</h3>
              <p className="mt-3 text-zinc-300 leading-relaxed max-w-xl">
                Cada respuesta tuya entrena el algoritmo. Si fallas un tema, vuelve más veces. Si lo dominas, lo aparcamos. Sin perder tiempo en lo que ya sabes.
              </p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/60 p-5">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                  <span>Tu cobertura del temario</span>
                  <span className="text-orange-300 font-medium">38% dominado</span>
                </div>
                <div className="space-y-2">
                  <TopicBar name="Constitución Española" pct={82} accent="emerald" />
                  <TopicBar name="Derecho UE" pct={61} accent="amber" />
                  <TopicBar name="Función Pública" pct={32} accent="orange" />
                  <TopicBar name="Procedimiento Admin." pct={12} accent="rose" />
                </div>
              </div>
            </div>
          </div>

          <FeatureCard icon="📝" title="Preguntas con explicación" desc="No solo el resultado: el por qué. Citando al BOE." />
          <FeatureCard icon="⏱️" title="Simulacros oficiales" desc="100 preguntas cronometradas. Formato del examen real." />
          <FeatureCard icon="📈" title="Tracking diario" desc="Racha, tiempo medio, % por tema. Métricas que motivan." />
          <FeatureCard icon="🔄" title="Repaso espaciado" desc="Las que fallas vuelven en 1 día, 3 días, 1 semana." />
          <FeatureCard icon="🔔" title="Temario al día" desc="Cuando cambia la norma, se actualizan las preguntas." />
        </div>
      </div>
    </section>
  );
}
function TopicBar({ name, pct, accent }: { name: string; pct: number; accent: "emerald"|"amber"|"orange"|"rose" }) {
  const color = { emerald: "from-emerald-500 to-emerald-400", amber: "from-amber-500 to-amber-400", orange: "from-orange-500 to-orange-400", rose: "from-rose-500 to-rose-400" }[accent];
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-zinc-300">{name}</span>
        <span className="text-zinc-500">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-1.5 rounded-full bg-gradient-to-r ${color}`} style={{width:`${pct}%`}}></div>
      </div>
    </div>
  );
}
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl glass p-6 hover:bg-white/[0.04] transition-colors">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─────────────── TESTIMONIALS ─────────────── */
function Testimonials() {
  return (
    <section className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Cómo lo viven</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Perfiles de opositor a los que <span className="text-gradient-warm">les encaja</span>.
        </h2>
        <p className="mt-4 text-zinc-400 text-lg max-w-2xl">
          Casos típicos que diseñamos al construir el producto. Cuando tengamos opiniones reales de clientes, las publicamos aquí firmadas.
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          <TestimonialCard
            initials="MG"
            color="from-orange-500 to-amber-500"
            name="Marta G., 32"
            role="Madre + opositora Aux. Admin."
            quote="Estudio cuando los niños duermen. 20 minutos al día consistentes me han llevado más lejos que 4 horas los sábados que nunca cumplía."
          />
          <TestimonialCard
            initials="DR"
            color="from-purple-500 to-violet-500"
            name="David R., 27"
            role="Recién licenciado, primera opo"
            quote="Las academias me daban miedo por el precio. Empecé con la gratis, vi que las preguntas eran las mismas que en mi temario, y pagué los 19.99 sin pensarlo."
          />
          <TestimonialCard
            initials="LP"
            color="from-rose-500 to-orange-500"
            name="Laura P., 41"
            role="Segundo intento, cerca del examen"
            quote="Lo que más me ayudó es saber qué temas tenía flojos. La primera vez estudiaba todo a partes iguales. Ahora voy directa a lo que me falla."
          />
        </div>
      </div>
    </section>
  );
}
function TestimonialCard({ initials, color, name, role, quote }: { initials: string; color: string; name: string; role: string; quote: string }) {
  return (
    <div className="rounded-2xl glass p-6">
      <div className="text-zinc-500 text-3xl leading-none mb-3">"</div>
      <p className="text-zinc-200 leading-relaxed">{quote}</p>
      <div className="mt-6 flex items-center gap-3">
        <div className={`grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br ${color} text-zinc-950 font-bold text-sm`}>{initials}</div>
        <div>
          <div className="text-sm font-medium text-zinc-100">{name}</div>
          <div className="text-xs text-zinc-500">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── COMPARISON ─────────────── */
function Comparison() {
  return (
    <section id="oposiciones" className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Comparativa</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Academia: <span className="text-zinc-500 line-through decoration-orange-500 decoration-2">€2.000/año</span>. iActReady: <span className="text-gradient-warm">€240</span>.
        </h2>
        <p className="mt-4 text-zinc-400 text-lg max-w-2xl">
          Mismo temario oficial. Mismas preguntas tipo test. Cinco veces menos.
        </p>

        <div className="mt-14 overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-4 px-5 text-zinc-400 font-medium"></th>
                <th className="py-4 px-5 font-semibold">
                  <div className="flex items-center gap-2"><span className="grid place-items-center h-6 w-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold text-xs">i</span>iActReady</div>
                </th>
                <th className="py-4 px-5 text-zinc-400 font-medium">Academia presencial</th>
                <th className="py-4 px-5 text-zinc-400 font-medium">Manuales en papel</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <CompRow label="Precio anual" iactready="€240" academia="€1.500-3.000" manuales="€200-400" highlight />
              <CompRow label="Disponibilidad" iactready="24/7" academia="Horario fijo" manuales="24/7" />
              <CompRow label="Plan adaptativo" iactready="✓ Por tema" academia="—" manuales="—" />
              <CompRow label="Preguntas con explicación" iactready="Ilimitadas" academia="Limitado" manuales="Sin explicación" />
              <CompRow label="Simulacros cronometrados" iactready="Semanal" academia="Trimestral" manuales="—" />
              <CompRow label="Actualización temario" iactready="Continua" academia="Anual" manuales="Edición nueva (€)" />
              <CompRow label="Móvil + escritorio" iactready="✓ Todo" academia="Solo aula" manuales="Solo casa" />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
function CompRow({ label, iactready, academia, manuales, highlight }: { label: string; iactready: string; academia: string; manuales: string; highlight?: boolean }) {
  return (
    <tr className={`border-b border-white/5 ${highlight ? "bg-orange-500/5" : ""}`}>
      <td className="py-3 px-5 text-zinc-400">{label}</td>
      <td className={`py-3 px-5 font-medium ${highlight ? "text-orange-300" : "text-zinc-100"}`}>{iactready}</td>
      <td className="py-3 px-5 text-zinc-500">{academia}</td>
      <td className="py-3 px-5 text-zinc-500">{manuales}</td>
    </tr>
  );
}

/* ─────────────── PRICING TEASER ─────────────── */
function PricingTeaser() {
  return (
    <section id="precios" className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>Precios</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight max-w-3xl">
          Empieza gratis. <span className="text-zinc-500">Sube cuando estés enganchado.</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard name="Gratis" price="€0" period="" bullets={["10 preguntas/día con explicación","Diagnóstico inicial","Tu progreso básico","Sin tarjeta"]} cta="Empezar gratis" href="/start" />
          <PlanCard name="Mensual" price="€19.99" period="/mes" highlight badge="Más popular" bullets={["Preguntas ilimitadas","Plan adaptativo completo","Simulacros oficiales semanales","Estadísticas detalladas","Cancela cuando quieras"]} cta="Suscribirme" href="/pricing" />
          <PlanCard name="Anual" price="€179" period="/año" badge="-25%" bullets={["Todo lo del Mensual","€14.92/mes equivalente","Compromiso con tu plaza","Pago único"]} cta="Ahorrar 25%" href="/pricing" />
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          Pago seguro con Stripe · Cancelas con 1 click · IVA incluido
        </p>
      </div>
    </section>
  );
}
function PlanCard({ name, price, period, bullets, cta, href, highlight, badge }: { name: string; price: string; period: string; bullets: string[]; cta: string; href: string; highlight?: boolean; badge?: string }) {
  return (
    <div className={`relative rounded-2xl p-7 ${highlight ? "border-2 border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-transparent" : "glass"}`}>
      {badge && (
        <div className={`absolute -top-3 ${highlight ? "left-1/2 -translate-x-1/2 bg-orange-500 text-zinc-950" : "right-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"} rounded-full px-3 py-1 text-xs font-semibold`}>
          {badge}
        </div>
      )}
      <h3 className="text-xl font-semibold">{name}</h3>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tracking-tight">{price}</span>
        {period && <span className="text-zinc-400">{period}</span>}
      </div>
      <ul className="mt-6 space-y-2.5 text-sm text-zinc-200">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2.5"><span className="shrink-0 text-orange-400 mt-0.5">✓</span><span>{b}</span></li>
        ))}
      </ul>
      <Link href={href} className={`mt-7 block w-full text-center rounded-xl px-4 py-3 font-semibold transition-colors ${highlight ? "bg-orange-500 text-zinc-950 hover:bg-orange-400" : "border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"}`}>{cta}</Link>
    </div>
  );
}

/* ─────────────── FAQ ─────────────── */
function FAQ() {
  const items = [
    { q: "¿Funciona como una academia real?", a: "Sí. Tienes el temario oficial completo (26 temas para Aux. Admin. del Estado, expandiéndose), preguntas tipo examen con explicación, simulacros cronometrados, y tu progreso medido por tema. La diferencia es que tú decides cuándo y dónde estudias — sin horarios fijos, sin desplazamientos." },
    { q: "¿De dónde salen las preguntas?", a: "Las generamos con IA (Claude Sonnet 4.5) basándonos en el temario oficial publicado en el BOE y en convocatorias anteriores. Cada pregunta queda ligada al artículo legal correspondiente (Constitución, Ley 39/2015, EBEP, etc.). Si detectas un error, lo corregimos en 24h." },
    { q: "¿Cuándo añadiréis mi oposición?", a: "Empezamos con Auxiliar Administrativo del Estado (C2) por volumen y por tener temario público estable. Próximas en cola: Auxilio Judicial, Tramitación Procesal, Maestros (Primaria + Secundaria) y oposiciones sanitarias. Si la tuya no está, escríbenos a hola@iactready.com y la priorizamos." },
    { q: "¿Cancelo cuando quiera?", a: "Sí. La suscripción mensual la cancelas con un click desde tu panel y deja de cobrar al instante. El anual es pago único — sin permanencia, sin cargos sorpresa." },
    { q: "¿Y si suspendo? ¿Me devolvéis el dinero?", a: "No vendemos suspensiones, vendemos preparación. Pero si en tu primer mes sientes que esto no te ayuda, escríbenos y te devolvemos el cargo. Sin preguntas." },
    { q: "¿Necesito ordenador potente?", a: "No. Funciona en cualquier navegador, móvil o portátil. Si tienes conexión a internet y 15 minutos al día, te vale." },
    { q: "¿Mis datos están seguros?", a: "Sí. Todos los datos viven en servidores europeos (Supabase EU, Irlanda). Cumplimos con GDPR. Tus respuestas y progreso son privados — solo tú los ves." },
  ];
  return (
    <section id="faq" className="px-6 py-20 md:py-28 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <SectionLabel center>Preguntas frecuentes</SectionLabel>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-center">
          Lo que querrás saber
        </h2>
        <div className="mt-14 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-2xl glass p-5 open:bg-white/[0.04]">
              <summary className="cursor-pointer flex items-center justify-between font-medium text-zinc-100 list-none">
                <span className="pr-4">{item.q}</span>
                <span className="shrink-0 grid place-items-center h-7 w-7 rounded-full border border-white/15 text-zinc-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-zinc-300 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── FINAL CTA ─────────────── */
function FinalCTA() {
  return (
    <section className="px-6 py-24 md:py-32 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-8">⏳</div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
          Cada día que pasa<br/>
          <span className="text-gradient-warm">es un día menos hasta tu plaza.</span>
        </h2>
        <p className="mt-6 text-zinc-300 text-lg md:text-xl max-w-xl mx-auto">
          Empieza con 10 preguntas gratis. Sin tarjeta. Sin compromiso.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/start" className="rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-9 py-4 font-semibold text-zinc-950 hover:from-orange-300 hover:to-orange-400 transition-all hover:shadow-2xl hover:shadow-orange-500/40">
            Empezar ahora →
          </Link>
          <Link href="/pricing" className="rounded-xl glass-strong px-9 py-4 font-medium text-zinc-100 hover:bg-white/10 transition-all">
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── FOOTER ─────────────── */
function Footer() {
  return (
    <footer className="border-t border-white/5 py-14 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-zinc-950 font-bold text-lg">i</div>
            <span className="font-bold text-lg">iActReady</span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">La IA que prepara tu oposición. Plan adaptativo, preguntas tipo test, simulacros oficiales.</p>
        </div>
        <FooterCol title="Producto" links={[
          { label: "Cómo funciona", href: "#producto" },
          { label: "Oposiciones", href: "#oposiciones" },
          { label: "Precios", href: "/pricing" },
          { label: "FAQ", href: "#faq" },
        ]} />
        <FooterCol title="Cuenta" links={[
          { label: "Empezar gratis", href: "/start" },
          { label: "Entrar", href: "/login" },
        ]} />
        <FooterCol title="Contacto" links={[
          { label: "hola@iactready.com", href: "mailto:hola@iactready.com" },
        ]} />
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 text-xs text-zinc-500 flex items-center justify-between flex-wrap gap-3">
        <span>© 2026 iActReady. Todos los derechos reservados.</span>
        <span className="flex items-center gap-2">Datos en EU · Pagos seguros con Stripe</span>
      </div>
    </footer>
  );
}
function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h4 className="text-zinc-100 font-semibold mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l, i) => (
          <li key={i}><Link href={l.href} className="text-zinc-400 hover:text-zinc-100 transition-colors">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────── HELPERS ─────────────── */
function SectionLabel({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
      <span className="h-px w-8 bg-gradient-to-r from-orange-500/60 to-transparent"></span>
      <span className="text-orange-400 text-xs font-semibold tracking-widest uppercase">{children}</span>
    </div>
  );
}
