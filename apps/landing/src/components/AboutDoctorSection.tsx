import { CalendarClock, Hospital, Quote, Stethoscope } from 'lucide-react';

/* ─── Dark section palette ───────────────────────────────────────────
   #16192a  → base background  (navy casi-carbón)
   #1e2235  → card background  (un tono más claro)
   #2a2f4a  → card border      (tono aún más claro, separación por tono)
   #f0b429  → amber accent     (solo íconos y cifras destacadas)
─────────────────────────────────────────────────────────────────── */

const CREDENTIALS = [
  {
    icon: Stethoscope,
    title: 'Jefa del Servicio de Pediatría',
    description: 'Hospital Eva Perón, Granadero Baigorria',
  },
  {
    icon: CalendarClock,
    // TODO: Reemplazar [X] por el número real de años (Agus lo pasa)
    title: '[X] años de ejercicio',
    description: 'En pediatría pública y privada',
  },
  {
    icon: Hospital,
    title: 'Experiencia hospitalaria',
    description: 'Atención en hospitales públicos y privados de la zona',
  },
];

export function AboutDoctorSection(): React.JSX.Element {
  return (
    <section
      id="doctora"
      className="relative overflow-hidden py-24 lg:py-32 scroll-mt-16"
      style={{ backgroundColor: '#16192a' }}
      aria-label="Sobre la Dra. Martinangelio"
    >
      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2 lg:gap-16">
        {/* ── Photo (left on desktop, top on mobile) ── */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {/* Marco blanco para que la foto resalte sobre el fondo oscuro */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-3 shadow-2xl shadow-black/40 reveal reveal-scale">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#f0f4f8]">
              {/* TODO: Reemplazar por foto real de la Dra. (bata blanca, fondo neutro) */}
              <img
                src="/doctora_landing.PNG"
                alt="Dra. Martinangelio — Jefa del Servicio de Pediatría del Hospital Eva Perón"
                width={720}
                height={880}
                loading="lazy"
                className="h-full w-full object-contain object-bottom"
              />
            </div>
          </div>

          {/* ── Floating badge ── */}
          <div
            className="absolute -bottom-5 left-6 flex reveal-float items-center gap-3 rounded-2xl bg-white p-3.5 pr-6 shadow-xl shadow-black/30"
            style={{ animationDelay: '250ms' }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F6BFF] text-white">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold text-[#0F1C36]">Pediatra de cabecera</p>
              <p className="text-[10px] font-medium text-gray-500">Pueblo Esther, Santa Fe</p>
            </div>
          </div>
        </div>

        {/* ── Copy + credentials (right) ── */}
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold reveal"
            style={{ backgroundColor: '#1e2235', color: '#93b8f8', border: '1px solid #2a2f4a' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#93b8f8]" aria-hidden="true" />
            Sobre la Dra. Martinangelio
          </span>

          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-white lg:text-5xl reveal"
            style={{ animationDelay: '90ms' }}
          >
            Una sola pediatra.
            <br />
            Todas las etapas de tu hijo.
          </h2>

          <p
            className="mt-6 text-base leading-relaxed lg:text-lg reveal"
            style={{ animationDelay: '180ms', color: '#a8b5cc' }}
          >
            La Dra. Martinangelio es Jefa del Servicio de Pediatría del Hospital Eva
            Perón de Granadero Baigorria, y atiende de forma particular en Pueblo
            Esther. Cada consulta la hace ella — no un equipo rotativo.
          </p>

          {/* ── Credentials cards ── */}
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CREDENTIALS.map((credential, i) => (
              <li
                key={credential.title}
                className="rounded-2xl p-5 transition-all hover:-translate-y-0.5 reveal"
                style={{
                  animationDelay: `${300 + i * 90}ms`,
                  backgroundColor: '#1e2235',
                  border: '1px solid #2a2f4a',
                }}
              >
                {/* Ícono con acento ámbar */}
                <div
                  className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(240,180,41,0.12)', color: '#f0b429' }}
                >
                  <credential.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                </div>
                <h3
                  className="font-display text-[15px] font-bold leading-snug"
                  style={{ color: '#e8edf5' }}
                >
                  {credential.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: '#6e7d9a' }}>
                  {credential.description}
                </p>
              </li>
            ))}
          </ul>

          {/* ── Closing phrase ── */}
          <blockquote
            className="mt-8 flex items-start gap-4 rounded-2xl p-6 reveal"
            style={{ animationDelay: '540ms', backgroundColor: '#1e2235', border: '1px solid #2a2f4a' }}
          >
            <Quote className="h-6 w-6 shrink-0" style={{ color: '#f0b429' }} aria-hidden="true" />
            <p className="text-sm font-medium leading-relaxed lg:text-base" style={{ color: '#c8d5e8' }}>
              No es una posta más en la fila de guardia: es la misma médica que va a
              acompañar a tu hijo desde el primer control hasta la adolescencia.
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}