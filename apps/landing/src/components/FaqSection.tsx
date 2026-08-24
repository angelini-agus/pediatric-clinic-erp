import { ArrowRight, HelpCircle, MessageCircle } from 'lucide-react';
import { ENV_URL_ERP, WHATSAPP_LINK } from '../config';

const FAQS = [
  {
    question: '¿Va a ser siempre la misma pediatra?',
    answer: 'Sí. No hay guardia rotativa ni consultorio de equipo: todas las consultas las da la Dra. Martinangelio.',
  },
  {
    question: '¿Tiene experiencia real, no solo consultorio particular?',
    answer:
      'Es Jefa del Servicio de Pediatría del Hospital Eva Perón y atiende también en otros hospitales públicos y privados de la zona.',
  },
  {
    question: '¿Y si mi hijo se enferma fuera de un control de rutina?',
    answer: 'El acompañamiento incluye los procesos de enfermedad, no solo los controles programados.',
  },
  {
    question: '¿Recién nace y ya tengo que buscar pediatra?',
    answer:
      'El acompañamiento puede empezar incluso antes: desde la etapa de preconcepción y durante el embarazo.',
  },
];

export function FaqSection(): React.JSX.Element {
  return (
    <section
      id="faq"
      className="relative overflow-hidden py-24 lg:py-32 scroll-mt-16"
      style={{ backgroundColor: '#EAF6F0' }}
      aria-label="Preguntas frecuentes"
    >
      {/* Blob decorativo — lavanda */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-32 top-10 h-[320px] w-[320px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(217,211,240,0.4)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge — borde lavanda */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold shadow-sm reveal"
            style={{
              backgroundColor: '#fff',
              border: '1.5px solid #D9D3F0',
              color: '#1B2A41',
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: '#D9D3F0' }}
              aria-hidden="true"
            />
            ¿Es para tu familia?
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-[#1B2A41] lg:text-5xl reveal"
            style={{ animationDelay: '90ms' }}
          >
            Las dudas que toda familia tiene antes de elegir
          </h2>
          <p
            className="mt-6 text-base leading-relaxed text-gray-500 lg:text-lg reveal"
            style={{ animationDelay: '180ms' }}
          >
            Respuestas directas, sin vueltas.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {FAQS.map((faq, index) => (
            <article
              key={faq.question}
              className="rounded-3xl bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md reveal"
              style={{ border: '1.5px solid #BEE3F8', animationDelay: `${240 + index * 90}ms` }}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="h-4 w-4 shrink-0" style={{ color: '#BEE3F8' }} aria-hidden="true" />
                <h3 className="text-sm font-medium text-gray-500">{faq.question}</h3>
              </div>
              <p className="mt-3 text-base font-bold leading-snug text-[#1B2A41]">{faq.answer}</p>
            </article>
          ))}

          {/* ── Card de turnos (se mantiene oscura — navy, no toca la paleta pastel) ── */}
          <article
            className="rounded-3xl bg-[#1B2A41] p-7 shadow-xl shadow-[#1B2A41]/20 md:col-span-2 reveal"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 shrink-0 text-[#BEE3F8]" aria-hidden="true" />
              <h3 className="text-sm font-medium text-slate-300">¿Cómo saco un turno?</h3>
            </div>
            <p className="mt-3 text-base font-bold leading-snug text-white">
              Directo por WhatsApp o desde el portal de turnos, sin trámites.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a
                href={WHATSAPP_LINK}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1B2A41] transition-all hover:bg-slate-100 active:scale-[0.97]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Escribir por WhatsApp
              </a>
              <a
                href={`${ENV_URL_ERP}/register`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/45 hover:bg-white/10 active:scale-[0.97] group"
              >
                Ver turnos disponibles
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}