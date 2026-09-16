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
      className="absolute -left-1 top-2 w-11 sm:w-16 md:w-20 lg:w-28"
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
      className="absolute right-3 top-5 w-7 sm:right-6 sm:top-12 sm:w-12 md:right-9 md:top-16 md:w-[88px]"
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

/* ── Doodle: bloques ABC (outline blanco sobre mostaza, en el lateral libre de la píldora) ── */
function DoodleBlocks(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="absolute left-2.5 top-[48%] -translate-y-1/2 flex flex-col items-center gap-0.5 sm:left-3.5 sm:gap-1 lg:left-5 lg:gap-1.5"
    >
      {['A', 'B', 'C'].map((letter, i) => (
        <div
          key={letter}
          className="flex h-5 w-5 sm:h-7 sm:w-7 lg:h-9 lg:w-9 items-center justify-center rounded sm:rounded-lg font-heading text-[10px] sm:text-xs lg:text-sm font-bold border-[1.5px] lg:border-2"
          style={{
            borderColor: 'rgba(255,255,255,0.85)',
            color: 'rgba(255,255,255,0.85)',
            transform: `rotate(${String(i === 0 ? -4 : i === 2 ? 4 : 2)}deg)`,
          }}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

/**
 * HeroSection — réplica 1:1 de la referencia:
 * izq. H1 serif oscuro + bajada chica + 2 CTAs (mostaza con círculo oscuro,
 * coral sólido); der. collage de 3 píldoras stadium (mostaza grande con
 * foto que sobresale, celeste arriba, coral abajo) + doodles (libro, nube,
 * bloques ABC). Copy/links nuestros, tratamiento visual igual.
 */
export function HeroSection(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="flex-1 flex flex-row w-full max-w-[1400px] mx-auto relative z-10 items-center overflow-x-clip px-3 sm:px-6 lg:px-8 py-4 lg:py-0"
    >
      {/* ── Textura de puntitos del fondo crema ── */}
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />

      {/* ── Columna izquierda — texto ── */}
      <div className="relative z-20 w-[48%] lg:w-1/2 flex items-center">
        <div className="w-full pl-2 pr-1 sm:px-4 lg:pl-6 lg:pr-4 flex flex-col">
          <h1
            className="heading-h1 text-[clamp(1.6rem,4vw,4.3rem)] text-[#241D15] load-rise"
            style={{ animationDelay: '50ms', letterSpacing: '-0.01em' }}
          >
            La misma pediatra,
            <br />
            en cada etapa de tu hijo
          </h1>

          <p
            className="mt-3 max-w-[420px] text-xs leading-relaxed sm:text-sm lg:mt-6 lg:text-base load-rise"
            style={{ animationDelay: '160ms', color: '#6B5F52' }}
          >
            Seguimiento pediátrico continuo desde la etapa de preconcepción hasta la adolescencia,
            siempre con la Dra. Martinangelio. Sacá turno o ingresá al portal para ver la historia
            clínica de tu hijo.
          </p>

          <div
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3 lg:gap-4 lg:mt-8 load-rise"
            style={{ animationDelay: '260ms' }}
          >
            {/* CTA primario — pill mostaza con círculo oscuro */}
            <a
              href={`${ENV_URL_ERP}/register`}
              id="hero-cta-turno"
              className="w-fit flex items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-xs font-semibold sm:text-sm sm:py-2 sm:pl-6 sm:pr-2 lg:pl-9 lg:pr-2.5 lg:text-lg transition-all text-[#241D15] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: '#F4C43F' }}
            >
              Sacar turno
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8 lg:h-10 lg:w-10"
                style={{ backgroundColor: '#241D15' }}
              >
                <ArrowRight
                  className="h-3.5 w-3.5 text-white lg:h-[18px] lg:w-[18px]"
                  aria-hidden="true"
                />
              </span>
            </a>
            {/* CTA secundario — pill coral sólido */}
            <a
              href="#doctora"
              id="hero-cta-doctora"
              className="w-fit flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold sm:text-sm sm:px-6 sm:py-2.5 lg:px-10 lg:py-3.5 lg:text-lg transition-all text-[#241D15] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: '#E96B3A' }}
            >
              Conocer a la Dra.
            </a>
          </div>
        </div>
      </div>

      {/* ── Columna derecha — collage 3 píldoras + doodles ── */}
      <div className="relative w-[52%] lg:w-1/2 h-[370px] sm:h-[460px] lg:h-full flex items-center justify-center overflow-visible">
        <div
          className="w-full h-full relative lg:absolute lg:inset-0 lg:-translate-y-[48px] load-fade"
          style={{ zIndex: 30, animationDelay: '220ms' }}
        >
          {/* Píldora mostaza grande — achicada y con más aire */}
          <div
            className="absolute rounded-full left-[35%] top-[53%] sm:left-[39%] lg:left-[44%] lg:top-[53%] -translate-x-1/2 -translate-y-1/2 w-[138px] h-[225px] sm:w-[185px] sm:h-[295px] lg:w-[clamp(240px,26vw,380px)] lg:h-[clamp(390px,40vw,570px)]"
            style={{
              backgroundColor: '#F4C43F',
              boxShadow: '0 20px 50px -20px rgba(36,29,21,0.3)',
              overflow: 'visible',
            }}
          >
            {/* Contenedor con overflow-hidden para que los doodles se recorten por la curva de la píldora */}
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <DoodleBook />
              <DoodleCloud />
              <DoodleBlocks />
            </div>
            {/* Foto de la Dra. dentro del óvalo de la píldora */}
            <img
              src="/doctora-landing.webp"
              srcSet="/doctora-landing-450.webp 450w, /doctora-landing-700.webp 700w, /doctora-landing.webp 900w"
              sizes="(min-width: 1462px) 357px, (max-width: 1024px) 226px, 24vw"
              alt={`${CLINIC_INFO.doctorFullName} con guardapolvo y estetoscopio`}
              className="absolute left-1/2 top-1/2 z-10 object-cover"
              style={{
                width: '94%',
                height: '88%',
                transform: 'translate(-50%, -50%)',
                borderRadius: '48% 52% 50% 50% / 52% 48% 52% 48%',
              }}
              width={900}
              height={1205}
              decoding="async"
              fetchPriority="high"
            />
          </div>

          {/* Píldora celeste arriba-derecha — achicada y separada hacia la derecha */}
          <PhotoPill
            color="#8CD7F2"
            photo="/nino-1.webp"
            srcSet="/nino-1-240.webp 240w, /nino-1-420.webp 420w, /nino-1.webp 600w"
            sizes="(max-width: 1024px) 162px, 227px"
            alt="Nene saltando con los brazos abiertos"
            photoOverflow
            className="left-[80%] top-[20%] sm:left-[81%] sm:top-[22%] lg:left-[84%] lg:top-[26%] w-[78px] h-[110px] sm:w-[105px] sm:h-[148px] lg:w-[clamp(150px,13vw,210px)] lg:h-[clamp(210px,18vw,300px)]"
            style={{
              transform: 'translate(-50%, -50%) rotate(4deg)',
            }}
          />

          {/* Píldora coral abajo-derecha — achicada y separada hacia abajo-derecha */}
          <PhotoPill
            color="#E96B3A"
            photo="/nino-2.webp"
            srcSet="/nino-2-240.webp 240w, /nino-2-420.webp 420w, /nino-2.webp 600w"
            sizes="(max-width: 1024px) 144px, 207px"
            alt="Nene caminando con un globo amarillo"
            photoOverflow
            photoOffsetX="-31.4%"
            photoWidth="90%"
            className="z-20 left-[79%] top-[82%] sm:left-[80%] sm:top-[82%] lg:left-[82%] lg:top-[84%] w-[84px] h-[122px] sm:w-[112px] sm:h-[160px] lg:w-[clamp(160px,14vw,230px)] lg:h-[clamp(230px,20vw,340px)]"
            style={{
              transform: 'translate(-50%, -50%) rotate(-3deg)',
            }}
          />
        </div>
      </div>
    </main>
  );
}
