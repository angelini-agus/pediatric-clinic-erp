import {
  Baby,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import { useRef } from 'react';

import BounceCards from './bounce-cards';

/* ─── Sección "Acompañamiento en cada etapa" ────────────────────────
   Desktop xl+: abanico interactivo de cards (BounceCards de React Bits)
   con animación de entrada elástica y hover que empuja los hermanos.
   Hasta xl: carrusel horizontal con scroll-snap y flechas. ── */

const STAGES = [
  {
    icon: HeartHandshake,
    accent: '#E96B3A',
    badge: 'Preconcepción',
    title: 'Antes de que llegue',
    description: 'Acompañamiento y asesoramiento a la familia antes de la llegada del bebé.',
    href: '#contacto',
  },
  {
    icon: Baby,
    accent: '#F3A9C0',
    badge: 'Recién Nacido',
    title: 'Los primeros días',
    description: 'Seguimiento desde los primeros días de vida.',
    href: '#contacto',
  },
  {
    icon: Sprout,
    accent: '#AEC17A',
    badge: 'Crecimiento',
    title: 'Cada etapa del desarrollo',
    description: 'Controles periódicos de peso, talla, hitos del desarrollo y vacunación.',
    href: '#contacto',
  },
  {
    icon: HeartPulse,
    accent: '#8CD7F2',
    badge: 'Enfermedad',
    title: 'Cuando más se necesita',
    description:
      'Atención y acompañamiento durante los procesos de enfermedad, con la misma pediatra que ya conoce al paciente.',
    href: '#contacto',
  },
  {
    icon: GraduationCap,
    accent: '#C9B8EA',
    badge: 'Adolescencia',
    title: 'Hasta último momento',
    description:
      'Presencia constante durante los desafíos de cada etapa, no solo en el consultorio.',
    href: '#contacto',
  },
];

/* Transforms del abanico: apertura simétrica con rotación leve. */
const BOUNCE_TRANSFORMS = [
  'rotate(-8deg) translate(-400px)',
  'rotate(-4deg) translate(-200px)',
  'rotate(0deg)',
  'rotate(4deg) translate(200px)',
  'rotate(8deg) translate(400px)',
];

type Stage = (typeof STAGES)[number];

function Doodle(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 18"
      className="pointer-events-none absolute right-6 top-6 w-10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ color: 'rgba(36,29,21,0.35)' }}
    >
      <path d="M2 12c4-8 8 4 12-4s8 4 12-4 8 4 12-4" />
      <path d="M2 4c4-6 8 2 12-4" />
    </svg>
  );
}

/* Contenido de la card de etapa — compartido entre el abanico y el carrusel. */
function StageCardBody({ stage }: { stage: Stage }): React.JSX.Element {
  return (
    <>
      <Doodle />

      {/* Ilustración/ícono directo sobre la card (como las ilustraciones de la referencia) */}
      <stage.icon
        className="h-12 w-12"
        strokeWidth={1.8}
        style={{ color: '#241D15' }}
        aria-hidden="true"
      />

      {/* Badge pill blanco translúcido — como el "Age (1-3)" */}
      <span
        className="mt-5 inline-flex rounded-full px-5 py-1.5 font-heading text-xs font-semibold uppercase tracking-wide"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: '#241D15' }}
      >
        {stage.badge}
      </span>

      <h3 className="heading-h3 mt-4 text-[#241D15]">{stage.title}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[#241D15]">{stage.description}</p>

      {/* "Conocer más" con circulito de flecha */}
      <a
        href={stage.href}
        className="group mt-auto inline-flex items-center gap-2.5 pt-5 font-heading text-sm font-bold text-[#241D15] hover:opacity-80 transition-opacity"
      >
        Conocer más
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#241D15] transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowRight className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </span>
      </a>
    </>
  );
}

export function JourneySection(): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: 1 | -1): void => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-stage-card]');
    const step = card ? card.offsetWidth + 48 : 360;
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  return (
    <section
      id="acompanamiento"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label="Acompañamiento en cada etapa"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        {/* ── Header: título izquierda + bajada derecha (como la referencia) ── */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12">
          <h2 className="heading-h2 text-[#3A2A1B] reveal">
            Te acompaña antes de que
            <br className="hidden lg:block" /> nazca, y en cada paso después
          </h2>
          <p
            className="max-w-[460px] text-sm leading-relaxed text-[#6B5F52] lg:text-base reveal"
            style={{ animationDelay: '90ms' }}
          >
            El seguimiento pediátrico no empieza en el primer control. La Dra. Martinangelio
            acompaña a la familia desde la etapa de preconcepción, y sigue presente en cada etapa
            del crecimiento.
          </p>
        </div>

        {/* ── Abanico interactivo (xl+) ── */}
        <div className="mt-14 hidden justify-center xl:flex">
          <BounceCards
            className="journey-bounce"
            count={STAGES.length}
            containerWidth={1100}
            containerHeight={460}
            animationDelay={0.4}
            animationDuration={1.1}
            animationStagger={0.07}
            easeType="elastic.out(1, 0.75)"
            transformStyles={BOUNCE_TRANSFORMS}
            pushOffset={90}
            renderItem={(index) => (
              <div
                className="flex h-full w-full flex-col items-center px-5 pb-7 pt-9 text-center"
                style={{ backgroundColor: STAGES[index].accent }}
              >
                <StageCardBody stage={STAGES[index]} />
              </div>
            )}
          />
        </div>

        {/* ── Carrusel horizontal (hasta xl) ── */}
        <div className="relative mt-12 lg:mt-14 xl:hidden">
          {/* Flechas — desktop */}
          <div
            className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20"
            aria-hidden="true"
          >
            <button
              type="button"
              onClick={() => {
                scrollByCards(-1);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#3A2A1B] shadow-lg transition-all hover:scale-105 active:scale-95"
              aria-label="Etapas anteriores"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20"
            aria-hidden="true"
          >
            <button
              type="button"
              onClick={() => {
                scrollByCards(1);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#3A2A1B] shadow-lg transition-all hover:scale-105 active:scale-95"
              aria-label="Siguientes etapas"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={trackRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {STAGES.map((stage) => (
              <article
                key={stage.badge}
                data-stage-card
                className="relative flex w-[260px] snap-start flex-col items-center rounded-card px-6 pb-8 pt-9 text-center transition-transform duration-300 hover:-translate-y-1.5 sm:w-[300px]"
                style={{
                  backgroundColor: stage.accent,
                  boxShadow: '0 20px 50px -24px rgba(36,29,21,0.35)',
                }}
              >
                <StageCardBody stage={stage} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
