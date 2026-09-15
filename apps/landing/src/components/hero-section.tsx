import { ArrowRight } from 'lucide-react';

import { CLINIC_INFO, ENV_URL_ERP } from '../config';

type PhotoPillProps = {
  color: string;
  photo: string;
  alt: string;
  className: string;
  style: React.CSSProperties;
  /**
   * Deja que la foto se salga de la píldora (ej. las manos del nene saltando
   * o la cabeza/globo del nene con globo).
   * El corte inferior va horneado en el asset siguiendo la curva de la cápsula,
   * por eso la píldora no recorta con overflow-hidden.
   */
  photoOverflow?: boolean;
  /** Corrimiento horizontal de la foto (por defecto centrada). */
  photoOffsetX?: string;
  /** Ancho de la foto respecto de la píldora (default 108%). */
  photoWidth?: string;
  /** Variantes responsivas (srcset) para que el browser baje la más chica. */
  srcSet?: string;
  /** Tamaño renderizado por breakpoint (requerido con srcset). */
  sizes?: string;
  children?: React.ReactNode;
};

/* ── Píldora stadium con recorte (cutout) anclado al borde inferior ──
   La foto es un PNG/WebP con transparencia: el nene "nace" desde abajo de
   la píldora, sin marco. ── */
function PhotoPill({
  color,
  photo,
  alt,
  className,
  style,
  photoOverflow = false,
  photoOffsetX = '-50%',
  photoWidth = '108%',
  srcSet,
  sizes,
  children,
}: PhotoPillProps): React.JSX.Element {
  return (
    <div
      className={`absolute flex flex-col items-center justify-end rounded-full ${
        photoOverflow ? '' : 'overflow-hidden'
      } ${className}`}
      style={{
        backgroundColor: color,
        ...style,
        boxShadow: '0 24px 60px -20px rgba(36,29,21,0.25)',
      }}
    >
      <img
        src={photo}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className="absolute bottom-0 left-1/2 max-w-none"
        style={{ width: photoWidth, transform: `translateX(${photoOffsetX})` }}
        decoding="async"
      />
      {children}
    </div>
  );
}

/* ── Doodle: libro abierto (outline claro sobre mostaza) ── */
function DoodleBook(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 90 64"
      className="absolute -left-1 top-2 w-16 sm:w-20 md:left-1 md:top-4 md:w-28"
      fill="none"
    >
      <path
        d="M45 10 C38 4 28 2 10 4 V40 C28 38 38 40 45 46 C52 40 62 38 80 40 V4 C62 2 52 4 45 10 Z"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M45 12 V46" stroke="rgba(255,255,255,0.85)" strokeWidth="3" />
      <path
        d="M18 14 L34 16 M18 22 L34 24 M56 16 L72 14 M56 24 L72 22"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Doodle: nube outline (sin texto) ── */
function DoodleCloud(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 56"
      className="absolute right-4 top-8 w-10 sm:right-6 sm:top-12 sm:w-12 md:right-9 md:top-16 md:w-[88px]"
      fill="none"
    >
      <path
        d="M60 50 H20 C10 50 3 43 3 35 C3 27 9 20 17 20 C18 12 26 6 35 6 C44 6 51 11 53 18 C57 10 67 5 77 5 C89 5 98 12 99 23 C108 24 115 31 115 39 C115 46 109 50 100 50 Z"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Doodle: bloques ABC (outline, sobre el crema, a la izquierda de la píldora coral) ── */
function DoodleBlocks(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-1 sm:gap-1.5">
      {['A', 'B', 'C'].map((letter, i) => (
        <div
          key={letter}
          className="flex h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 items-center justify-center rounded-md sm:rounded-lg font-heading text-xs sm:text-sm font-bold"
          style={{
            border: '2px solid rgba(58,42,27,0.55)',
            color: 'rgba(58,42,27,0.75)',
            transform: `rotate(${String(i === 0 ? -4 : i === 2 ? 4 : 2)}deg)`,
          }}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

/* ── Doodle: zigzag de líneas (sobre la píldora coral, abajo-derecha) ── */
function DoodleZigzag(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 60"
      className="absolute bottom-6 right-3 w-12 sm:bottom-8 sm:right-4 sm:w-16 md:bottom-10 md:right-6 md:w-24"
      fill="none"
    >
      <path
        d="M4 12 l18 8 l-18 8 l18 8 M60 10 l18 8 l-18 8 l18 8"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * HeroSection — réplica 1:1 de la referencia:
 * izq. H1 serif oscuro + bajada chica + 2 CTAs (mostaza con círculo oscuro,
 * coral sólido); der. collage de 3 píldoras stadium (mostaza grande con
 * foto que sobresale, celeste arriba, coral abajo) + doodles (libro, nube,
 * bloques ABC, zigzag). Copy/links nuestros, tratamiento visual igual.
 */
export function HeroSection(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="flex-1 flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto relative z-10 justify-center lg:justify-between items-center px-4 sm:px-6 lg:px-8 pt-4 pb-12 lg:py-0 overflow-x-clip"
    >
      {/* ── Textura de puntitos del fondo crema ── */}
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />

      {/* ── Columna izquierda — texto ── */}
      <div className="relative z-20 w-full lg:w-[50%] flex items-center pt-2 pb-6 lg:py-0">
        <div className="w-full px-2 sm:px-4 lg:pl-6 lg:pr-4 flex flex-col items-start text-left">
          <h1
            className="heading-h1 text-[clamp(2.1rem,5vw,4.3rem)] text-[#241D15] load-rise"
            style={{ animationDelay: '50ms', letterSpacing: '-0.01em' }}
          >
            La misma pediatra,
            <br />
            en cada etapa de tu hijo
          </h1>

          <p
            className="mt-4 max-w-[440px] text-base leading-relaxed lg:mt-6 load-rise"
            style={{ animationDelay: '160ms', color: '#6B5F52' }}
          >
            Seguimiento pediátrico continuo desde la etapa de preconcepción hasta la adolescencia,
            siempre con la Dra. Martinangelio. Sacá turno o ingresá al portal para ver la historia
            clínica de tu hijo.
          </p>

          <div
            className="mt-6 flex flex-col sm:flex-row gap-3 lg:gap-4 lg:mt-8 load-rise w-full sm:w-auto"
            style={{ animationDelay: '260ms' }}
          >
            {/* CTA primario — pill mostaza con círculo oscuro (como "Schedule a Tour ⊙") */}
            <a
              href={`${ENV_URL_ERP}/register`}
              id="hero-cta-turno"
              className="w-fit flex items-center gap-3 rounded-full py-2.5 pl-7 pr-2 text-base font-semibold lg:py-2 lg:pl-9 lg:pr-2.5 lg:text-lg transition-all text-[#241D15] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: '#F4C43F' }}
            >
              Sacar turno
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full lg:h-10 lg:w-10"
                style={{ backgroundColor: '#241D15' }}
              >
                <ArrowRight
                  className="h-4 w-4 text-white lg:h-[18px] lg:w-[18px]"
                  aria-hidden="true"
                />
              </span>
            </a>
            {/* CTA secundario — pill coral sólido (como "Explore Programs") */}
            <a
              href="#doctora"
              id="hero-cta-doctora"
              className="w-fit flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold lg:px-10 lg:py-3.5 lg:text-lg transition-all text-[#241D15] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: '#E96B3A' }}
            >
              Conocer a la Dra.
            </a>
          </div>
        </div>
      </div>

      {/* ── Columna derecha — collage 3 píldoras + doodles ── */}
      <div
        className="relative w-full lg:w-1/2 h-[370px] sm:h-[430px] lg:h-full flex items-center justify-center my-4 lg:my-0"
        style={{ overflow: 'visible' }}
      >
        <div
          className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-none h-full lg:absolute lg:inset-0 load-fade"
          style={{ zIndex: 30, animationDelay: '220ms' }}
        >
          <div className="w-full h-full relative lg:-translate-y-[50px]">
            {/* Píldora mostaza grande — foto recortada que sobresale */}
            <div
              className="absolute rounded-full left-[40%] top-1/2 lg:left-[44%] lg:top-[53%] -translate-x-1/2 -translate-y-1/2 w-[180px] h-[285px] sm:w-[215px] sm:h-[335px] lg:w-[clamp(240px,26vw,380px)] lg:h-[clamp(390px,40vw,570px)]"
              style={{
                backgroundColor: '#F4C43F',
                boxShadow: '0 30px 70px -24px rgba(36,29,21,0.3)',
                overflow: 'visible',
              }}
            >
              {/* Contenedor con overflow-hidden para que los doodles se recorten por la curva de la píldora */}
              <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                <DoodleBook />
                <DoodleCloud />
              </div>
              {/* Foto de la Dra. dentro del óvalo de la píldora.
                  WebP optimizado (800px, ~47 KB) generado con sharp.
                  fetchpriority=high: es el elemento LCP del hero. */}
              <img
                src="/doctora-landing.webp"
                srcSet="/doctora-landing-360.webp 360w, /doctora-landing-600.webp 600w, /doctora-landing.webp 800w"
                sizes="(min-width: 1462px) 357px, (max-width: 1024px) 226px, 24vw"
                alt={`${CLINIC_INFO.doctorFullName} con guardapolvo y estetoscopio`}
                className="absolute left-1/2 top-1/2 z-10 object-cover"
                style={{
                  width: '94%',
                  height: '88%',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '48% 52% 50% 50% / 52% 48% 52% 48%',
                }}
                width={800}
                height={1071}
                decoding="async"
                fetchPriority="high"
              />
            </div>

            {/* Píldora celeste arriba-derecha — recorte de nene que nace desde
                abajo; las manos se salen del fondo celeste (photoOverflow). */}
            <PhotoPill
              color="#8CD7F2"
              photo="/nino-1.webp"
              srcSet="/nino-1-240.webp 240w, /nino-1-420.webp 420w, /nino-1.webp 600w"
              sizes="(max-width: 1024px) 162px, 227px"
              alt="Nene saltando con los brazos abiertos"
              photoOverflow
              className="left-[78%] top-[24%] lg:left-[84%] lg:top-[26%] w-[105px] h-[145px] sm:w-[130px] sm:h-[180px] lg:w-[clamp(150px,13vw,210px)] lg:h-[clamp(210px,18vw,300px)]"
              style={{
                transform: 'translate(-50%, -50%) rotate(3deg)',
              }}
            />

            {/* Píldora coral abajo-derecha — nene con globo: centrado en la píldora,
                la cabeza y el globo se salen por arriba y las piernas se cortan
                con la curva inferior (corte horneado en el asset).
                z-20: tapa los bloques ABC (que quedan por encima de la doctora). */}
            <PhotoPill
              color="#E96B3A"
              photo="/nino-2.webp"
              srcSet="/nino-2-240.webp 240w, /nino-2-420.webp 420w, /nino-2.webp 600w"
              sizes="(max-width: 1024px) 144px, 207px"
              alt="Nene caminando con un globo amarillo"
              photoOverflow
              photoOffsetX="-31.4%"
              photoWidth="90%"
              className="z-20 left-[76%] top-[76%] lg:left-[82%] lg:top-[84%] w-[110px] h-[155px] sm:w-[135px] sm:h-[190px] lg:w-[clamp(160px,14vw,230px)] lg:h-[clamp(230px,20vw,340px)]"
              style={{
                transform: 'translate(-50%, -50%) rotate(-3deg)',
              }}
            >
              <DoodleZigzag />
            </PhotoPill>

            {/* Bloques ABC — por encima de la doctora (z-10) pero por debajo de
                la píldora coral (z-20), que los tapa donde se superponen. */}
            <div
              className="absolute left-[58%] top-[58%] lg:left-[63%] lg:top-[63%]"
              style={{ transform: 'translate(-50%, -50%)', zIndex: 10 }}
            >
              <DoodleBlocks />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
