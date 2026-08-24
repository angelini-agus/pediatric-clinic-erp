import { Baby, GraduationCap, HeartHandshake, Sprout } from 'lucide-react';

/* ─── Pastel palette ─────────────────────────────────────────────────
   Nodo bg alterna entre:
   • acento1 = #BEE3F8  (celeste bebé)
   • acento2 = #D9D3F0  (lavanda suave)
   El ícono dentro siempre en navy #1B2A41 (trazo, nunca relleno blanco)
─────────────────────────────────────────────────────────────────── */

const NODE_BG = ['#BEE3F8', '#D9D3F0', '#BEE3F8', '#D9D3F0'] as const;

const STAGES = [
  {
    icon: HeartHandshake,
    step: '01',
    title: 'Preconcepción',
    description: 'Acompañamiento y asesoramiento a la familia antes de la llegada del bebé.',
  },
  {
    icon: Baby,
    step: '02',
    title: 'Recién nacido',
    description: 'Seguimiento desde los primeros días de vida.',
  },
  {
    icon: Sprout,
    step: '03',
    title: 'Crecimiento y desarrollo',
    description: 'Controles periódicos de peso, talla, hitos del desarrollo y vacunación.',
  },
  {
    icon: GraduationCap,
    step: '04',
    title: 'Adolescencia',
    description:
      'Presencia constante durante los desafíos de cada etapa, no solo en el consultorio: acompañando a la familia.',
  },
];

/* ── Ilustración decorativa: nube simple en trazo fino ── */
function CloudDeco(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 50"
      fill="none"
      stroke="#D9D3F0"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-10 top-8 w-14 opacity-55 lg:w-20"
    >
      <path d="M62 38H20a14 14 0 1 1 5-27 18 18 0 1 1 37 5 10 10 0 1 1 0 22Z" />
    </svg>
  );
}

export function JourneySection(): React.JSX.Element {
  return (
    <section
      id="acompanamiento"
      className="relative overflow-hidden py-24 lg:py-32 scroll-mt-16"
      style={{ backgroundColor: '#EAF6F0' }}
      aria-label="Acompañamiento en cada etapa"
    >
      {/* Ilustración decorativa — nube */}
      <CloudDeco />

      {/* Blobs decorativos actualizados a la paleta menta/lavanda */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-32 top-0 h-[320px] w-[320px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(190,227,248,0.35)' }}
        />
        <div
          className="absolute -left-40 bottom-0 h-[340px] w-[340px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(217,211,240,0.35)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge — borde celeste bebé */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm reveal"
            style={{
              backgroundColor: '#fff',
              border: '1.5px solid #BEE3F8',
              color: '#1B2A41',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#BEE3F8' }}
              aria-hidden="true"
            />
            Acompañamiento
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-[#1B2A41] lg:text-5xl reveal"
            style={{ animationDelay: '90ms' }}
          >
            Te acompaña antes de que nazca, y en cada paso después
          </h2>
          <p
            className="mt-6 text-base leading-relaxed text-gray-500 lg:text-lg reveal"
            style={{ animationDelay: '180ms' }}
          >
            El seguimiento pediátrico no empieza en el primer control. La Dra.
            Martinangelio acompaña a la familia desde la etapa de preconcepción, y
            sigue presente en cada etapa del crecimiento.
          </p>
        </div>

        {/* ── Timeline horizontal (desktop) ── */}
        <ol className="relative mt-20 hidden md:block" aria-label="Etapas del acompañamiento">
          {/* Línea conectora en pastel */}
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-7 h-0.5 rounded-full reveal-x"
            style={{
              background: 'linear-gradient(to right, transparent, #BEE3F8 30%, #D9D3F0 70%, transparent)',
              animationDelay: '220ms',
            }}
          />
          <div className="grid grid-cols-4 gap-6">
            {STAGES.map((stage, i) => (
              <li key={stage.step} className="flex flex-col items-center text-center reveal" style={{ animationDelay: `${280 + i * 110}ms` }}>
                {/* Nodo pastel con ícono navy */}
                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full shadow-lg ring-4 ring-white"
                  style={{ backgroundColor: NODE_BG[i] }}
                >
                  <stage.icon className="h-6 w-6" strokeWidth={2} style={{ color: '#1B2A41' }} aria-hidden="true" />
                  {/* Número en esquina */}
                  <span
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full font-display text-[10px] font-bold text-white ring-2 ring-white"
                    style={{ backgroundColor: '#1B2A41' }}
                    aria-hidden="true"
                  >
                    {stage.step}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-[#1B2A41]">{stage.title}</h3>
                <p className="mt-2 max-w-[24ch] text-sm leading-relaxed text-gray-500">
                  {stage.description}
                </p>
              </li>
            ))}
          </div>
        </ol>

        {/* ── Timeline vertical (mobile) ── */}
        <ol
          className="relative ml-6 mt-14 space-y-10 md:hidden"
          style={{ borderLeft: '2px solid #BEE3F8' }}
          aria-label="Etapas del acompañamiento"
        >
          {STAGES.map((stage, i) => (
            <li key={stage.step} className="relative pl-10 reveal" style={{ animationDelay: `${i * 80}ms` }}>
              <div
                className="absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full shadow-md ring-4 ring-white"
                style={{ backgroundColor: NODE_BG[i] }}
              >
                <stage.icon className="h-5 w-5" strokeWidth={2} style={{ color: '#1B2A41' }} aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#1B2A41]">{stage.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}