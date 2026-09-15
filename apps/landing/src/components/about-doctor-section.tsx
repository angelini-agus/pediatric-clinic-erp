import { CLINIC_INFO } from '../config';

/* ─── Sección "Sobre la Dra. Martinangelio" ─────────────────────────
   Referencia Meelo: trío de cards casi cuadradas — las laterales con
   foto full-bleed y una "mancha" orgánica (borde superior ondulado de
   dos lomas, no elipse) pegada abajo con el texto; la del medio en
   coral sólido con manchas orgánicas de fondo y headline serif+script
   centrada. ── */

/* ── Mancha orgánica reutilizable con dos variantes de curvatura ──
   viewBox 600x300: curvas onduladas pronunciadas e irregulares. */
type ManchaProps = {
  fill: string;
  className?: string;
  opacity?: number;
  variant?: 'primary' | 'secondary';
};

function Mancha({
  fill,
  className,
  opacity = 1,
  variant = 'primary',
}: ManchaProps): React.JSX.Element {
  const path =
    variant === 'primary'
      ? 'M-5 130 C45 75 105 18 185 28 C255 38 280 115 340 120 C405 125 435 38 505 32 C555 28 585 75 605 102 L605 315 L-5 315 Z'
      : 'M-5 95 C65 25 125 35 195 90 C265 145 315 50 385 22 C455 -6 515 85 605 60 L605 315 L-5 315 Z';

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 300"
      preserveAspectRatio="none"
      className={className}
      style={{ opacity }}
    >
      <path fill={fill} d={path} />
    </svg>
  );
}

/* ── Mancha / ameba orgánica flotante (400x400) para fondos y acentos ── */
function OrganicBlob({
  fill = '#D8552B',
  className,
  opacity = 0.35,
}: {
  fill?: string;
  className?: string;
  opacity?: number;
}): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={className} style={{ opacity }}>
      <path
        fill={fill}
        d="M205 8 C288 4 362 62 386 148 C408 228 366 322 288 366 C210 410 108 398 46 330 C-14 264 -6 128 74 54 C112 20 158 10 205 8 Z"
      />
    </svg>
  );
}

type StoryCardProps = {
  accent: string;
  imageSrc?: string;
  imageAlt?: string;
  photoLabel?: string;
  title: string;
  text: string;
  waveVariant?: 'primary' | 'secondary';
};

function StoryPhotoCard({
  accent,
  imageSrc,
  imageAlt,
  photoLabel,
  title,
  text,
  waveVariant = 'primary',
}: StoryCardProps): React.JSX.Element {
  return (
    <article
      className="group relative h-full aspect-[5/6] overflow-hidden rounded-card sm:aspect-[11/10] cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ border: '1px solid rgba(36,29,21,0.06)' }}
      aria-label={title}
    >
      {/* ── Foto full-bleed superior con sutil zoom en hover ── */}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={imageAlt ?? title}
          className="absolute inset-x-0 top-0 h-[72%] w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      ) : (
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
      )}

      {/* ── Base sólida inferior contra filtraciones ── */}
      <div
        className="absolute -bottom-1 inset-x-0 h-[28%] pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* ── Mancha orgánica sólida con animación al hover ── */}
      <Mancha
        fill={accent}
        variant={waveVariant}
        className="absolute -bottom-1 -inset-x-0.5 h-[64%] w-[calc(100%+4px)] pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-2 group-hover:scale-y-107 group-hover:scale-x-[1.01]"
      />

      {/* ── Texto sobre la mancha ── */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-10 lg:px-7 lg:pb-7 transition-transform duration-500 group-hover:-translate-y-1">
        <h3 className="heading-h3 text-[#241D15]">{title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#241D15]/85 sm:text-sm">{text}</p>
      </div>
    </article>
  );
}

function StoryCoralCard(): React.JSX.Element {
  return (
    <article
      className="group relative flex h-full min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-card px-8 py-12 text-center sm:min-h-0 sm:px-10 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ backgroundColor: '#E96B3A' }}
      aria-label="Pública y Privada"
    >
      {/* ── Manchas orgánicas de fondo animadas al hover ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <OrganicBlob
          fill="#D8552B"
          opacity={0.42}
          className="absolute -left-[20%] -top-[25%] h-[90%] w-[90%] rotate-180 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:rotate-[215deg] group-hover:-translate-x-3 group-hover:-translate-y-2"
        />
        <OrganicBlob
          fill="#C4481F"
          opacity={0.32}
          className="absolute -bottom-[28%] -right-[15%] h-[92%] w-[92%] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-130 group-hover:-rotate-35 group-hover:translate-x-3 group-hover:translate-y-2"
        />
        <OrganicBlob
          fill="#F4C43F"
          opacity={0.18}
          className="absolute left-[20%] top-[30%] h-[60%] w-[60%] transition-all duration-700 ease-out group-hover:scale-140 group-hover:rotate-90 group-hover:opacity-25"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center transition-transform duration-500 group-hover:scale-[1.02]">
        <p className="heading-h3 text-[2rem] leading-tight text-[#241D15]">
          Pública{' '}
          <span className="font-script text-[1.6em]" style={{ color: '#F4C43F' }}>
            y
          </span>{' '}
          Privada
        </p>
        <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-[#241D15]">
          Se formó y trabajó en el sistema público y privado. Hoy atiende en su consultorio
          particular en Pueblo Esther.
        </p>
      </div>
    </article>
  );
}

export function AboutDoctorSection(): React.JSX.Element {
  const yearsOfPractice = new Date().getFullYear() - CLINIC_INFO.pediatricSince;

  return (
    <section
      id="doctora"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label={`Sobre ${CLINIC_INFO.doctorFullName}`}
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
              waveVariant="primary"
              imageSrc="/dra-con-paciente.webp"
              imageAlt={`${CLINIC_INFO.doctorFullName} sosteniendo a una paciente en consulta`}
              title="Experiencia hospitalaria"
              text="Hospital Eva Perón, Sanatorio de Niños y Grupo Oroño: guardia de urgencias y recepción de recién nacidos."
            />
          </div>

          <div className="reveal" style={{ animationDelay: '210ms' }}>
            <StoryCoralCard />
          </div>

          <div className="reveal reveal-right" style={{ animationDelay: '300ms' }}>
            <StoryPhotoCard
              accent="#F3A9C0"
              waveVariant="secondary"
              imageSrc="/dra-en-consulta.webp"
              imageAlt={`${CLINIC_INFO.doctorFullName} en consulta pediátrica`}
              title={`${String(yearsOfPractice)}+ Años de Trayectoria`}
              text={`Recibida de Médica Pediátrica en ${String(CLINIC_INFO.pediatricSince)}. Más de ${String(yearsOfPractice)} años dedicados exclusivamente a la pediatría.`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
