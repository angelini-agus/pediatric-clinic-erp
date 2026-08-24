import { ArrowRight, MessageCircle } from 'lucide-react';
import { ENV_URL_ERP, WHATSAPP_LINK } from '../config';

export function TurnosSection(): React.JSX.Element {
  return (
    <section
      id="turnos"
      className="relative overflow-hidden bg-[#0F1C36] py-20 lg:py-24 scroll-mt-16"
      aria-label="Turnos"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[360px] w-[640px] -translate-x-1/2 rounded-full bg-[#1F6BFF]/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-[280px] w-[280px] rounded-full bg-[#4a90ff]/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-white lg:text-5xl reveal">
          Sacá un turno en menos de 2 minutos
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 lg:text-lg reveal" style={{ animationDelay: '100ms' }}>
          Accedé al portal para ver la agenda disponible, sacar turno y consultar
          la historia clínica de tu hijo.
        </p>

        <div className="mt-10 reveal" style={{ animationDelay: '200ms' }}>
          <a
            href={ENV_URL_ERP}
            className="inline-flex items-center gap-2.5 rounded-xl bg-white px-10 py-5 text-lg font-semibold text-[#0F1C36] shadow-xl shadow-black/20 transition-all hover:bg-slate-100 active:scale-[0.97] btn-shine group"
          >
            Ver turnos disponibles
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>

        <a
          href={WHATSAPP_LINK}
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 underline decoration-[#4a90ff] decoration-2 underline-offset-4 transition-colors hover:text-white reveal"
          style={{ animationDelay: '300ms' }}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          ¿Primera vez? Escribinos por WhatsApp antes de sacar turno
        </a>
      </div>
    </section>
  );
}