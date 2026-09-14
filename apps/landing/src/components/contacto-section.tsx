import { ArrowRight, Clock, MapPin, MessageCircle } from 'lucide-react';

import { CLINIC_INFO, ENV_URL_ERP, WHATSAPP_LINK } from '../config';

export function ContactoSection(): React.JSX.Element {
  return (
    <section
      id="contacto"
      className="bg-dots relative overflow-hidden py-20 lg:py-28 scroll-mt-16"
      style={{ backgroundColor: '#F4EEDF' }}
      aria-label="Contacto"
    >
      <div className="relative z-10 mx-auto max-w-[1400px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="heading-h2 text-[#3A2A1B] reveal">
            ¿Tenés una consulta antes de sacar turno?
          </h2>
          <p
            className="mt-4 text-base leading-relaxed text-[#6B5F52] lg:text-lg reveal"
            style={{ animationDelay: '90ms' }}
          >
            Escribinos directo por WhatsApp, la {CLINIC_INFO.doctor} o su consultorio te responde a
            la brevedad.
          </p>

          <div className="mt-8 reveal" style={{ animationDelay: '180ms' }}>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#E96B3A] px-10 py-5 text-lg font-semibold text-[#241D15] shadow-xl shadow-[#E96B3A]/30 transition-all hover:brightness-105 active:scale-[0.97] btn-shine"
            >
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        {/* ── Info cards ── */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="flex items-start gap-4 rounded-card px-7 py-8 transition-transform duration-300 hover:-translate-y-1 reveal"
            style={{
              backgroundColor: '#C9B8EA',
              boxShadow: '0 20px 50px -24px rgba(36,29,21,0.35)',
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
              <MapPin
                className="h-5 w-5"
                strokeWidth={2}
                style={{ color: '#C9B8EA' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="heading-h3 text-[#241D15]">Dirección</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#241D15]">
                {CLINIC_INFO.address} — {CLINIC_INFO.location}
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-card px-7 py-8 transition-transform duration-300 hover:-translate-y-1 reveal"
            style={{
              backgroundColor: '#86C6CB',
              boxShadow: '0 20px 50px -24px rgba(36,29,21,0.35)',
              animationDelay: '100ms',
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-md">
              <Clock
                className="h-5 w-5"
                strokeWidth={2}
                style={{ color: '#86C6CB' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <h3 className="heading-h3 text-[#241D15]">Horarios</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#241D15]">{CLINIC_INFO.hours}</p>
              <a
                href={`${ENV_URL_ERP}/register`}
                className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#241D15] underline decoration-[#241D15]/40 underline-offset-2 transition-opacity hover:opacity-80"
              >
                Ver turnos en el portal
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Mapa ── */}
        {/* TODO (Agus): reemplazar la búsqueda por la dirección exacta del consultorio */}
        <div
          className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-card shadow-xl reveal"
          style={{ border: '1px solid rgba(36,29,21,0.08)', animationDelay: '150ms' }}
        >
          <iframe
            title={`Mapa — Consultorio de la ${CLINIC_INFO.doctorFullName}, Pueblo Esther`}
            src="https://www.google.com/maps?q=Pueblo%20Esther%2C%20Santa%20Fe&output=embed"
            width="100%"
            height="360"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[360px] w-full border-0"
          />
        </div>
      </div>
    </section>
  );
}
