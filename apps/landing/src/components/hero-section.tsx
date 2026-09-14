import { ArrowRight } from 'lucide-react';

import { ENV_URL_ERP } from '../config';

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
      className="absolute left-7 top-9 w-16 md:w-20"
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
      className="absolute right-9 top-16 w-14 md:w-[88px]"
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

/* ── Doodle: onda gruesa (al estilo de la que recorre detrás del niño) ── */
function DoodleWave(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 320"
      className="absolute left-0 top-24 w-full"
      fill="none"
    >
      <path
        d="M20 100 C60 60 120 70 150 110 C180 150 130 200 90 240 C60 270 90 300 130 300"
        stroke="#E8A62C"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Doodle: bloques ABC (outline, sobre el crema, a la izquierda de la píldora coral) ── */
function DoodleBlocks(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="absolute flex flex-col items-center gap-1.5">
      {['A', 'B', 'C'].map((letter, i) => (
        <div
          key={letter}
          className="flex h-9 w-9 items-center justify-center rounded-lg font-heading text-sm font-bold"
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
      className="absolute bottom-10 right-6 w-16 md:w-24"
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
 * onda, bloques ABC, zigzag). Copy/links nuestros, tratamiento visual igual.
 */
export function HeroSection(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="flex-1 flex flex-row w-full max-w-[1400px] mx-auto relative z-10"
      style={{ overflow: 'visible' }}
    >
      {/* ── Textura de puntitos del fondo crema ── */}
      <div
        aria-hidden="true"
        className="bg-dots pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />

      {/* ── Columna izquierda — texto ── */}
      <div className="relative z-20 w-[52%] lg:w-1/2 flex items-center">
        <div className="w-full px-6 lg:pl-6 lg:pr-4 flex flex-col">
          <h1
            className="heading-h1 text-[clamp(2rem,4.4vw,4.3rem)] text-[#241D15] load-rise"
            style={{ animationDelay: '50ms', letterSpacing: '-0.01em' }}
          >
            La misma pediatra,
            <br />
            en cada etapa de tu hijo
          </h1>

          <p
            className="mt-4 max-w-[420px] text-sm leading-relaxed lg:mt-6 lg:text-base load-rise"
            style={{ animationDelay: '160ms', color: '#6B5F52' }}
          >
            Seguimiento pediátrico continuo desde la etapa de preconcepción hasta la adolescencia,
            siempre con la Dra. Martinangelio. Sacá turno o ingresá al portal para ver la historia
            clínica de tu hijo.
          </p>

          <div
            className="mt-6 flex flex-col gap-3 lg:flex-row lg:gap-4 lg:mt-8 load-rise"
            style={{ animationDelay: '260ms' }}
          >
            {/* CTA primario — pill mostaza con círculo oscuro (como "Schedule a Tour ⊙") */}
            <a
              href={`${ENV_URL_ERP}/register`}
              id="hero-cta-turno"
              className="w-fit flex items-center gap-3 rounded-full py-2 pl-7 pr-2 text-base font-semibold lg:pl-9 lg:pr-2.5 lg:text-lg transition-all text-[#241D15] hover:brightness-105 active:scale-[0.97]"
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
      <div className="relative w-[48%] lg:w-1/2 h-full" style={{ overflow: 'visible' }}>
        <div className="absolute inset-0 load-fade" style={{ zIndex: 30, animationDelay: '220ms' }}>
          {/* Píldora mostaza grande — foto recortada que sobresale */}
          <div
            className="absolute rounded-full"
            style={{
              left: '44%',
              top: '53%',
              transform: 'translate(-50%, -50%)',
              width: 'clamp(240px, 26vw, 380px)',
              height: 'clamp(390px, 40vw, 570px)',
              backgroundColor: '#F4C43F',
              boxShadow: '0 30px 70px -24px rgba(36,29,21,0.3)',
              overflow: 'visible',
            }}
          >
            <DoodleBook />
            <DoodleCloud />
            <DoodleWave />
            {/* Foto de la Dra. dentro del óvalo de la píldora.
                WebP optimizado (900px, ~68 KB) generado con sharp desde
                public/doctora_landing.PNG (el original se conserva). */}
            <img
              src="/doctora-landing.webp"
              alt="Dra. Martinangelio con guardapolvo y estetoscopio"
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
            />
          </div>

          {/* Píldora celeste arriba-derecha — recorte de nene que nace desde
              abajo; las manos se salen del fondo celeste (photoOverflow). */}
          <PhotoPill
            color="#8CD7F2"
            photo="/nino-1.webp"
            alt="Nene saltando con los brazos abiertos"
            photoOverflow
            className=""
            style={{
              left: '84%',
              top: '26%',
              transform: 'translate(-50%, -50%) rotate(3deg)',
              width: 'clamp(150px, 13vw, 210px)',
              height: 'clamp(210px, 18vw, 300px)',
            }}
          />

          {/* Píldora coral abajo-derecha — nene con globo: centrado en la píldora,
              la cabeza y el globo se salen por arriba y las piernas se cortan
              con la curva inferior (corte horneado en el asset).
              z-20: tapa los bloques ABC (que quedan por encima de la doctora). */}
          <PhotoPill
            color="#E96B3A"
            photo="/nino-2.webp"
            alt="Nene caminando con un globo amarillo"
            photoOverflow
            photoOffsetX="-31.4%"
            photoWidth="90%"
            className="z-20"
            style={{
              left: '82%',
              top: '84%',
              transform: 'translate(-50%, -50%) rotate(-3deg)',
              width: 'clamp(160px, 14vw, 230px)',
              height: 'clamp(230px, 20vw, 340px)',
            }}
          >
            <DoodleZigzag />
          </PhotoPill>

          {/* Bloques ABC — por encima de la doctora (z-10) pero por debajo de
              la píldora coral (z-20), que los tapa donde se superponen. */}
          <div
            className="absolute"
            style={{ left: '63%', top: '63%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
          >
            <DoodleBlocks />
          </div>
        </div>
      </div>
    </main>
  );
}
