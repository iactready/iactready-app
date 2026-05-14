import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Header />
      <Hero />
      <SocialProof />
      <ProductDemo />
      <Features />
      <Comparison />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/70 border-b border-white/5">
      <div className="px-6 py-3 max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold">i</div>
          <span className="font-bold text-lg">iActReady</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
          <a href="#producto" className="hover:text-white">Producto</a>
          <a href="#precios" className="hover:text-white">Precios</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
          <Link href="/login" className="hover:text-white">Entrar</Link>
        </nav>
        <Link href="/start" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-orange-400 transition-colors">
          Empezar gratis
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-6 pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-5xl mx-auto text-center">
        <div className="fade-up inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse"></span>
          Aux. Administrativo del Estado · Más oposiciones cada mes
        </div>
        <h1 className="fade-up-delay-1 mt-6 text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
          La IA que estudia<br/>
          contigo cada día,<br/>
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">hasta aprobar.</span>
        </h1>
        <p className="fade-up-delay-2 mt-8 text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Plan personalizado, 20 preguntas al día con explicación, simulacros oficiales y tracking de progreso.
          Por <strong>1/5 del precio</strong> de una academia presencial.
        </p>
        <div className="fade-up-delay-3 mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/start" className="group rounded-lg bg-orange-500 px-7 py-3.5 font-semibold text-zinc-950 hover:bg-orange-400 transition-colors flex items-center gap-2">
            Empezar gratis<span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link href="#producto" className="rounded-lg border border-white/15 bg-white/5 px-7 py-3.5 font-medium text-zinc-100 hover:bg-white/10 transition-colors">
            Ver cómo funciona
          </Link>
        </div>
        <p className="fade-up-delay-3 mt-5 text-xs text-zinc-500">10 preguntas gratis al día · Sin tarjeta · Cancela cuando quieras</p>
      </div>
      <div className="fade-up-delay-3 mt-16 md:mt-20 max-w-3xl mx-auto">
        <ProductCard />
      </div>
    </section>
  );
}

function ProductCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none"></div>
      <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
          <span>Pregunta 7 / 20</span>
          <span className="flex items-center gap-3">
            <span>✓ 5 correctas</span>
            <span>🔥 12 días</span>
          </span>
        </div>
        <div className="inline-block rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-zinc-400 mb-4">
          Tema 5: El Gobierno · Composición y funciones
        </div>
        <h3 className="text-lg md:text-xl font-medium leading-relaxed">
          Según el artículo 99.1 de la Constitución Española, ¿quién propone al candidato a Presidente del Gobierno para su investidura?
        </h3>
        <div className="mt-5 space-y-2">
          <Option letter="a" text="El Presidente del Congreso de los Diputados" />
          <Option letter="b" text="El Rey, previa consulta con los grupos parlamentarios" highlight />
          <Option letter="c" text="El Presidente del Senado" />
          <Option letter="d" text="El propio candidato por iniciativa propia" />
        </div>
        <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-300">✓ Correcta</p>
          <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed">
            El Rey propone candidato tras consultar con los grupos con representación parlamentaria (Art. 99.1 CE). La a y c son incorrectas porque no es competencia de los presidentes de las cámaras. La d no procede en nuestro sistema parlamentario.
          </p>
        </div>
      </div>
    </div>
  );
}

function Option({ letter, text, highlight }: { letter: string; text: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-2.5 flex items-start gap-3 ${highlight ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}>
      <span className={`shrink-0 grid place-items-center h-6 w-6 rounded-full text-xs font-bold ${highlight ? "bg-emerald-500 text-zinc-950" : "bg-white/10 text-zinc-300"}`}>{letter}</span>
      <span className="text-sm text-zinc-200">{text}</span>
    </div>
  );
}

function SocialProof() {
  return (
    <section className="px-6 py-12 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat number="26" label="Temas oficiales BOE" />
          <Stat number="130+" label="Preguntas con explicación" />
          <Stat number="€19.99" label="vs €1.500/año academia" />
          <Stat number="24/7" label="Estudia cuando puedas" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">{number}</div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </div>
  );
}

function ProductDemo() {
  return (
    <section id="producto" className="px-6 py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-orange-400 text-sm font-medium tracking-wide uppercase">Cómo funciona</span>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">Estudias menos. Apruebas antes.</h2>
          <p className="mt-4 text-zinc-300">Tres pasos para que cada minuto que dediques cuente.</p>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Step num="1" title="Te diagnosticamos" description="Eliges tu oposición y tu nivel. En 5 minutos sabemos qué dominas y qué te falla." />
          <Step num="2" title="Plan diario adaptativo" description="Cada día 20 preguntas tuyas: 60% en tus puntos débiles, 40% repaso de lo aprendido." />
          <Step num="3" title="Aprendes con cada error" description="Explicación clara de la respuesta correcta + por qué fallan las otras. Citas al BOE." />
        </div>
      </div>
    </section>
  );
}

function Step({ num, title, description }: { num: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
      <div className="grid place-items-center h-10 w-10 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold">{num}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="px-6 py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-orange-400 text-sm font-medium tracking-wide uppercase">Lo que incluye</span>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">Todo lo que necesitas. Nada de relleno.</h2>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Feature icon="🎯" title="Plan personalizado adaptativo" description="Detectamos qué temas dominas y cuáles tienes flojos. El plan se reordena cada semana según tus aciertos." />
          <Feature icon="📝" title="Preguntas con explicación" description="Cada pregunta lleva una explicación clara: por qué es la correcta y por qué fallan las otras. Citas al BOE." />
          <Feature icon="⏱️" title="Simulacros oficiales" description="100 preguntas cronometradas, formato y dificultad del examen real. Sabes cómo vas antes del día D." />
          <Feature icon="📈" title="Tracking de progreso" description="Racha de días, porcentaje del temario dominado, tiempo medio por pregunta. Métricas que motivan." />
          <Feature icon="🔥" title="Repaso espaciado" description="Las preguntas que fallas vuelven a aparecer en 1 día, 3 días, 1 semana. La ciencia del aprendizaje." />
          <Feature icon="📚" title="Temario actualizado" description="Las preguntas se actualizan cuando cambia la normativa o sale convocatoria nueva. Sin esperar al próximo manual." />
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Comparison() {
  return (
    <section id="precios" className="px-6 py-20 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-orange-400 text-sm font-medium tracking-wide uppercase">Comparativa</span>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">
            Academia: <span className="text-zinc-500 line-through decoration-orange-500">€1.500-3.000</span>. iActReady: <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">€240</span>.
          </h2>
          <p className="mt-4 text-zinc-300">Mismo temario. Mismas preguntas oficiales. Cinco veces menos.</p>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 pr-4 text-zinc-400 font-medium"></th>
                <th className="py-3 px-4 font-semibold">iActReady</th>
                <th className="py-3 px-4 text-zinc-400 font-medium">Academia presencial</th>
                <th className="py-3 pl-4 text-zinc-400 font-medium">Manuales en papel</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <Row label="Precio anual" iactready="€240" academia="€1.500-3.000" manuales="€200-400" highlight />
              <Row label="Disponibilidad" iactready="24/7" academia="Horario fijo" manuales="24/7" />
              <Row label="Plan adaptativo" iactready="✓" academia="—" manuales="—" />
              <Row label="Preguntas con explicación" iactready="Ilimitadas" academia="Limitado" manuales="Sin explicación" />
              <Row label="Simulacros cronometrados" iactready="Semanal" academia="Trimestral" manuales="—" />
              <Row label="Actualización temario" iactready="Continua" academia="Anual" manuales="Edición nueva (€)" />
              <Row label="Aprende donde estés" iactready="Móvil + web" academia="Aula" manuales="Solo en casa" />
            </tbody>
          </table>
        </div>
        <div className="mt-10 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-7 py-3.5 font-semibold text-zinc-950 hover:bg-orange-400 transition-colors">
            Ver planes detallados →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Row({ label, iactready, academia, manuales, highlight }: { label: string; iactready: string; academia: string; manuales: string; highlight?: boolean }) {
  return (
    <tr className={`border-b border-white/5 ${highlight ? "bg-orange-500/5" : ""}`}>
      <td className="py-3 pr-4 text-zinc-400">{label}</td>
      <td className={`py-3 px-4 font-medium ${highlight ? "text-orange-300" : "text-zinc-100"}`}>{iactready}</td>
      <td className="py-3 px-4 text-zinc-500">{academia}</td>
      <td className="py-3 pl-4 text-zinc-500">{manuales}</td>
    </tr>
  );
}

function FAQ() {
  const items = [
    { q: "¿Funciona como una academia real?", a: "Sí. Tienes el temario oficial completo (26 temas para Aux. Admin. del Estado, expandiéndose), preguntas tipo examen con explicación, simulacros cronometrados, y tu progreso medido por tema. Lo único que falta es el aula física — a cambio puedes estudiar a tu ritmo, cuando puedas." },
    { q: "¿De dónde salen las preguntas?", a: "Las generamos con IA basándonos en el temario oficial del BOE y en convocatorias anteriores. Cada pregunta se valida contra la fuente legal correspondiente (Constitución, Ley 39/2015, EBEP, etc.) y la explicación cita el artículo concreto. Si detectas algo erróneo, lo corregimos en 24h." },
    { q: "¿Cuándo añadiréis mi oposición?", a: "Empezamos con Auxiliar Administrativo del Estado (C2). Próximas en cola: Auxilio Judicial, Tramitación Procesal, Maestros (Primaria + Secundaria), y oposiciones sanitarias. Si la tuya no está, dínoslo a hola@iactready.com y la priorizamos." },
    { q: "¿Cancelo cuando quiera?", a: "Sí. La suscripción mensual la cancelas con un click desde tu panel y deja de cobrar al instante. El anual es pago único — sin permanencia, sin cargos sorpresa." },
    { q: "¿Y si suspendo? ¿Me devolvéis el dinero?", a: "No vendemos suspensiones, vendemos preparación. Pero si en tu primer mes sientes que esto no te ayuda, escríbenos y te devolvemos el cargo. Sin preguntas." },
    { q: "¿Necesito mucho aparato tecnológico?", a: "No. Va en cualquier navegador, móvil o portátil. Si tienes conexión a internet y 15 minutos al día, te vale." },
  ];
  return (
    <section id="faq" className="px-6 py-20 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <span className="text-orange-400 text-sm font-medium tracking-wide uppercase">Preguntas frecuentes</span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">Lo que querrás saber antes de probarlo</h2>
        </div>
        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group rounded-xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04]">
              <summary className="cursor-pointer flex items-center justify-between font-medium text-zinc-100 list-none">
                <span>{item.q}</span>
                <span className="ml-4 grid place-items-center h-6 w-6 rounded-full border border-white/15 text-zinc-400 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-zinc-300 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-6 py-24 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Cada día que pasa<br/>
          es un día menos hasta tu plaza.
        </h2>
        <p className="mt-5 text-zinc-300 text-lg">Empieza ahora con 10 preguntas gratis. Sin tarjeta.</p>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
          <Link href="/start" className="rounded-lg bg-orange-500 px-8 py-4 font-semibold text-zinc-950 hover:bg-orange-400 transition-colors">Empezar ahora →</Link>
          <Link href="/pricing" className="rounded-lg border border-white/15 bg-white/5 px-8 py-4 font-medium text-zinc-100 hover:bg-white/10 transition-colors">Ver planes</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="grid place-items-center h-7 w-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-bold text-sm">i</div>
            <span className="font-bold">iActReady</span>
          </div>
          <p className="text-zinc-400 text-xs">La IA que prepara tu oposición.</p>
        </div>
        <FooterCol title="Producto" links={[{ label: "Cómo funciona", href: "#producto" }, { label: "Precios", href: "/pricing" }, { label: "FAQ", href: "#faq" }]} />
        <FooterCol title="Cuenta" links={[{ label: "Entrar", href: "/login" }, { label: "Empezar gratis", href: "/start" }]} />
        <FooterCol title="Contacto" links={[{ label: "hola@iactready.com", href: "mailto:hola@iactready.com" }]} />
      </div>
      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-white/5 text-xs text-zinc-500 flex items-center justify-between flex-wrap gap-3">
        <span>© 2026 iActReady. Todos los derechos reservados.</span>
        <span>Datos alojados en EU · Pagos seguros con Stripe</span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h4 className="text-zinc-100 font-medium mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l, i) => (<li key={i}><Link href={l.href} className="text-zinc-400 hover:text-zinc-100">{l.label}</Link></li>))}
      </ul>
    </div>
  );
}
