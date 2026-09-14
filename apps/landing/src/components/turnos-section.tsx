import { ArrowRight } from 'lucide-react';

import { ENV_URL_ERP } from '../config';

export function TurnosSection(): React.JSX.Element {
  return (
    <section
      id="turnos"
      className="relative overflow-hidden pt-8 pb-20 lg:pt-10 lg:pb-24 scroll-mt-16"
      aria-label="Turnos"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div
          className="relative overflow-hidden rounded-[999px] px-8 py-12 text-center lg:px-16 lg:py-16"
          style={{
            backgroundColor: '#E96B3A',
            boxShadow: '0 24px 70px -28px rgba(233,107,58,0.65)',
          }}
        >
          {/* Blobs decorativos sutiles */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute"
              style={{
                left: '-8%',
                top: '-30%',
                width: '34%',
                height: '120%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
            <div
              className="absolute"
              style={{
                right: '-6%',
                bottom: '-40%',
                width: '40%',
                height: '130%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="heading-h2 text-[#241D15] reveal">
              Sacá un turno en menos de 2 minutos
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#241D15] lg:text-lg reveal"
              style={{ animationDelay: '100ms' }}
            >
              Accedé al portal para ver la agenda disponible, sacar turno y consultar la historia
              clínica de tu hijo.
            </p>

            <div className="mt-8 reveal" style={{ animationDelay: '200ms' }}>
              <a
                href={ENV_URL_ERP}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-10 py-5 text-lg font-semibold text-[#E96B3A] shadow-xl shadow-black/15 transition-all hover:brightness-105 active:scale-[0.97] btn-shine group"
              >
                Ver turnos disponibles
                <ArrowRight
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
