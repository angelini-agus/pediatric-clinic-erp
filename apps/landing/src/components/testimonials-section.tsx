import { Hospital, Quote, Stethoscope, Users } from 'lucide-react';

import { CLINIC_INFO } from '../config';

/* ─── Sección "Familias que ya confían" ──────────────────────────────
   Cifras arriba + cards de testimonios, todo con color de acento
   SÓLIDO (mismo lenguaje que Acompañamiento): íconos, cifras y textos
   en oscuro; avatar invertido (círculo blanco + inicial en el acento). ── */

const CARD_SHADOW = '0 20px 50px -24px rgba(36,29,21,0.35)';

const YEARS_OF_PRACTICE = new Date().getFullYear() - CLINIC_INFO.pediatricSince;

const STATS = [
  {
    icon: Stethoscope,
    value: `${String(YEARS_OF_PRACTICE)}+`,
    label: 'Años ejerciendo pediatría',
    accent: '#E96B3A',
  },
  {
    icon: Users,
    value: '50+',
    label: 'Pacientes en seguimiento activo',
    accent: '#AEC17A',
  },
  {
    icon: Hospital,
    value: '3',
    label: 'Instituciones de referencia',
    accent: '#86C6CB',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Gracias por estar siempre en nuestras vidas y cuidar a nuestro tesoro más valioso con tanta dedicación y cariño. Para nosotros sos la mejor pediatra del mundo.',
    name: 'Gise y Tati',
    child: 'papás de Emi (3 años)',
    image: '/testimonio-nino-1.webp',
    accent: '#AEC17A',
  },
  {
    quote:
      'Tener una médica de tanta confianza desde los primeros meses nos da una tranquilidad absoluta. Siempre atenta, cálida y súper clara en cada consulta.',
    name: 'Florencia y Martín',
    child: 'papás de Benja (18 meses)',
    image: '/testimonio-nino-2.webp',
    accent: '#86C6CB',
  },
  {
    quote:
      'La paciencia y el amor con el que atiende a los chicos hace que ir al consultorio sea un momento hermoso y sin miedos. Es una profesional con una vocación única.',
    name: 'Mariana',
    child: 'mamá de Sofi (5 años)',
    image: '/testimonio-nino-3.webp',
    accent: '#F3A9C0',
  },
];

export function TestimonialsSection(): React.JSX.Element {
  return (
    <section
      id="testimonios"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label="Testimonios"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        {/* ── Header ── */}
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="heading-h2 text-[#3A2A1B] reveal">Familias que ya confían</h2>
        </div>

        {/* ── Cifras (Mobile: 1 sola tarjeta unificada) ── */}
        <div
          className="mt-8 sm:hidden relative rounded-card overflow-hidden grid grid-cols-3 divide-x divide-[#241D15]/15 reveal"
          style={{ boxShadow: CARD_SHADOW }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-start px-2 py-5 text-center"
              style={{ backgroundColor: stat.accent }}
            >
              <stat.icon
                className="h-5 w-5 shrink-0"
                strokeWidth={2}
                style={{ color: '#241D15' }}
                aria-hidden="true"
              />
              <p className="heading-h1 mt-1.5 text-2xl font-bold text-[#241D15]">{stat.value}</p>
              <p className="mt-1 text-[11px] font-medium leading-tight text-[#241D15]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Cifras (Tablet / Desktop: 3 tarjetas independientes) ── */}
        <div className="mt-10 hidden sm:grid sm:grid-cols-3 gap-6 lg:mt-14">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative flex flex-col items-center rounded-card px-6 py-10 text-center transition-transform duration-300 hover:-translate-y-1 reveal"
              style={{ backgroundColor: stat.accent, boxShadow: CARD_SHADOW }}
            >
              <stat.icon
                className="h-6 w-6"
                strokeWidth={2}
                style={{ color: '#241D15' }}
                aria-hidden="true"
              />
              <p className="heading-h1 mt-3 text-5xl text-[#241D15]">{stat.value}</p>
              <p className="mt-2 text-sm font-medium leading-snug text-[#241D15]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonios ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-14">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative flex flex-col rounded-card px-8 py-10 transition-transform duration-300 hover:-translate-y-1 reveal"
              style={{ backgroundColor: testimonial.accent, boxShadow: CARD_SHADOW }}
            >
              {/* Comillas decorativas grandes */}
              <Quote
                className="h-10 w-10"
                style={{ color: '#241D15', opacity: 0.5 }}
                aria-hidden="true"
              />
              <p className="mt-4 flex-1 text-[15px] italic leading-relaxed text-[#241D15]">
                "{testimonial.quote}"
              </p>
              <footer
                className="mt-6 flex items-center gap-3 pt-5"
                style={{ borderTop: '1px solid rgba(36,29,21,0.15)' }}
              >
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={`Paciente hijo/a de ${testimonial.name}`}
                    className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-heading text-sm font-bold"
                    style={{ color: testimonial.accent }}
                    aria-hidden="true"
                  >
                    {testimonial.name.replace(/[\[\]]/g, '').charAt(0) || '•'}
                  </div>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-bold text-[#241D15]">{testimonial.name}</p>
                  <p className="text-xs text-[#241D15]">{testimonial.child}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
