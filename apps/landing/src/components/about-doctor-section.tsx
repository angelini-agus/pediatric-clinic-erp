/* ─── Sección "Sobre la Dra. Martinangelio" ─────────────────────────
   Referencia Meelo: trío de cards casi cuadradas — las laterales con
   foto full-bleed y una "mancha" orgánica (borde superior ondulado de
   dos lomas, no elipse) pegada abajo con el texto; la del medio en
   coral sólido con manchas orgánicas de fondo y headline serif+script
   centrada. ── */

/* ── Mancha orgánica reutilizable ──
   viewBox 600x300: borde superior ondulado (dos lomas, valle suave) y
   cierre recto por el fondo; las esquinas inferiores las recorta el
   rounded-card + overflow-hidden del contenedor.
   preserveAspectRatio="none" para estirarla al ancho del card. */
type ManchaProps = {
  fill: string;
  className?: string;
  opacity?: number;
};

function Mancha({ fill, className, opacity = 1 }: ManchaProps): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 300"
      preserveAspectRatio="none"
      className={className}
      style={{ opacity }}
    >
      <path
        fill={fill}
        d="M0 108 C30 78 82 30 168 30 C232 30 254 86 290 86 C330 86 352 40 410 40 C472 40 528 94 600 98 L600 300 L0 300 Z"
      />
    </svg>
  );
}

type StoryCardProps = {
  accent: string;
  photoLabel: string;
  title: string;
  text: string;
};

function StoryPhotoCard({ accent, photoLabel, title, text }: StoryCardProps): React.JSX.Element {
  return (
    <article
      className="relative h-full aspect-[5/6] overflow-hidden rounded-card sm:aspect-[11/10]"
      style={{ border: '1px solid rgba(36,29,21,0.06)' }}
      aria-label={title}
    >
      {/* ── Foto placeholder full-bleed (base neutra + tinte del acento;
             se reemplaza por la foto real) ──
             TODO (Agus): optimizar la foto real con astro:assets en el
             .astro de la página (getImage/<Image>) y pasar la URL
             optimizada como prop — no un <img> sin srcset/WebP. */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(140deg, #E9E1D2 0%, #D2C7B2 100%)' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 32%, ${accent}33 0%, transparent 62%)`,
          }}
        />
        <div className="absolute inset-x-0 top-[15%] flex justify-center">
          <span className="px-6 text-center font-heading text-sm font-semibold text-[#6B5F52]">
            Foto: {photoLabel}
          </span>
        </div>
      </div>

      {/* ── Mancha orgánica abajo, pegada a los bordes del card ── */}
      <Mancha fill={accent} className="absolute inset-x-0 bottom-0 h-[58%] w-full" />

      {/* ── Texto sobre la mancha ── */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-10 lg:px-7 lg:pb-7">
        <h3 className="heading-h3 text-[#241D15]">{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#241D15]/85 sm:text-sm">{text}</p>
      </div>
    </article>
  );
}

function StoryCoralCard(): React.JSX.Element {
  return (
    <article
      className="relative flex h-full min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-card px-8 py-12 text-center sm:min-h-0 sm:px-10"
      style={{ backgroundColor: '#E96B3A' }}
      aria-label="Pública y Privada"
    >
      {/* ── Manchas orgánicas de fondo (patrón "Safe & Environment") ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Mancha
          fill="#D8552B"
          opacity={0.38}
          className="absolute -left-[22%] -top-[32%] h-[78%] w-[82%] rotate-180"
        />
        <Mancha
          fill="#D8552B"
          opacity={0.32}
          className="absolute -bottom-[34%] -right-[16%] h-[82%] w-[88%]"
        />
      </div>

      <div className="relative flex flex-col items-center">
        <p className="heading-h3 text-[2rem] leading-tight text-[#241D15]">
          Pública{' '}
          <span className="font-script text-[1.6em]" style={{ color: '#F4C43F' }}>
            y
          </span>{' '}
          Privada
        </p>
        <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-[#241D15]">
          Ejerce en hospitales públicos y privados de la zona, además de su consultorio particular
          en Pueblo Esther.
        </p>
      </div>
    </article>
  );
}

export function AboutDoctorSection(): React.JSX.Element {
  return (
    <section
      id="doctora"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label="Sobre la Dra. Martinangelio"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        {/* ── Header de la sección ── */}
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="heading-h2 text-[#3A2A1B] reveal">
            Una sola pediatra que ya conoce a tu hijo
          </h2>
          <p
            className="mt-4 text-base leading-relaxed text-[#6B5F52] lg:text-lg reveal"
            style={{ animationDelay: '90ms' }}
          >
            Cada consulta la da la Dra. Martinangelio — no un equipo rotativo.
          </p>
        </div>

        {/* ── Trío de cards ── */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16 lg:gap-7">
          <div className="reveal reveal-left" style={{ animationDelay: '120ms' }}>
            <StoryPhotoCard
              accent="#AEC17A"
              photoLabel="la Dra. en el consultorio"
              title="Jefa de Servicio"
              text="Jefa del Servicio de Pediatría del Hospital Eva Perón, Granadero Baigorria."
            />
          </div>

          <div className="reveal" style={{ animationDelay: '210ms' }}>
            <StoryCoralCard />
          </div>

          <div className="reveal reveal-right" style={{ animationDelay: '300ms' }}>
            <StoryPhotoCard
              accent="#F3A9C0"
              photoLabel="la Dra. en el hospital"
              title="[X]+ Años de Trayectoria"
              text="Más de [X] años dedicados exclusivamente a la pediatría."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
