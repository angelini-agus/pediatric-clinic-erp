import { ArrowRight, HelpCircle } from 'lucide-react';

import { ENV_URL_ERP } from '../config';

/* ─── Sección "¿Es para tu familia?" ─────────────────────────────────
   Grilla de 2 columnas (1 en mobile) con cards de color acento SÓLIDO,
   mismo lenguaje que las cards de Acompañamiento: ícono en círculo
   blanco, pregunta en label y respuesta en heading, todo en oscuro.
   La última card (turnos) va en coral sólido con botones invertidos. ── */

const ACCENTS = {
  sage: '#AEC17A',
  pink: '#F3A9C0',
  lavender: '#C9B8EA',
  teal: '#86C6CB',
} as const;

const CARD_SHADOW = '0 20px 50px -24px rgba(36,29,21,0.35)';

const FAQS = [
  {
    accent: 'sage',
    question: '¿Va a ser siempre la misma pediatra?',
    answer:
      'Sí. No hay guardia rotativa ni consultorio de equipo: todas las consultas las da la Dra. Martinangelio.',
  },
  {
    accent: 'pink',
    question: '¿Tiene experiencia real, no solo consultorio particular?',
    answer:
      'Sí. Se recibió de Médica Pediátrica en 2014; pasó por el Hospital Eva Perón, el Sanatorio de Niños de Rosario y el Grupo Oroño, con experiencia en guardia de urgencias y recepción de recién nacidos.',
  },
  {
    accent: 'lavender',
    question: '¿Y si mi hijo se enferma fuera de un control de rutina?',
    answer:
      'El acompañamiento incluye los procesos de enfermedad, no solo los controles programados.',
  },
  {
    accent: 'teal',
    question: '¿Recién nace y ya tengo que buscar pediatra?',
    answer:
      'El acompañamiento puede empezar incluso antes: desde la etapa de preconcepción y durante el embarazo.',
  },
] as const;

export function FaqSection(): React.JSX.Element {
  return (
    <section
      id="faq"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label="Preguntas frecuentes"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        {/* ── Header ── */}
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="heading-h2 text-[#3A2A1B] reveal">¿Es para tu familia?</h2>
        </div>

        {/* ── Grilla 2 columnas ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14">
          {FAQS.map((faq) => {
            const accent = ACCENTS[faq.accent];
            return (
              <article
                key={faq.question}
                className="relative flex flex-col rounded-card px-8 py-10 transition-transform duration-300 hover:-translate-y-1 reveal"
                style={{ backgroundColor: accent, boxShadow: CARD_SHADOW }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                  <HelpCircle className="h-6 w-6" style={{ color: accent }} aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-body text-sm font-semibold uppercase tracking-wide text-[#241D15]">
                  {faq.question}
                </h3>
                <p className="heading-h3 mt-2 text-[#241D15]">{faq.answer}</p>
              </article>
            );
          })}

          {/* ── Card de turnos — coral sólido (acción principal de la sección) ── */}
          <article
            className="relative flex flex-col rounded-card px-8 py-10 md:col-span-2 transition-transform duration-300 hover:-translate-y-1 reveal"
            style={{ backgroundColor: '#E96B3A', boxShadow: CARD_SHADOW }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-[#241D15]">
                  ¿Cómo saco un turno?
                </h3>
                <p className="heading-h3 mt-2 text-[#241D15]">
                  Directo desde el portal de turnos, sin trámites.
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
                <a
                  href={`${ENV_URL_ERP}/register`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#E96B3A] transition-all hover:brightness-105 active:scale-[0.97] group"
                >
                  Ver turnos disponibles
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
