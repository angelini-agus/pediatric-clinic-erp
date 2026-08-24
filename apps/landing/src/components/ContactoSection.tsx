import { Clock, MapPin, MessageCircle } from 'lucide-react';
import { CLINIC_INFO, WHATSAPP_LINK } from '../config';

/* ── Ilustración decorativa: globo de aire en trazo fino ── */
function BalloonDeco(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 50 80"
      fill="none"
      stroke="#F7B9A8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute right-10 top-10 w-10 opacity-45 lg:w-14"
    >
      {/* Globo */}
      <ellipse cx="25" cy="26" rx="16" ry="20" />
      {/* Nudo */}
      <path d="M25 46 Q27 50 25 52 Q23 50 25 46Z" fill="#F7B9A8" stroke="none" />
      {/* Hilo */}
      <path d="M25 52 Q22 60 26 70" />
    </svg>
  );
}

export function ContactoSection(): React.JSX.Element {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden py-24 lg:py-32 scroll-mt-16"
      style={{ backgroundColor: '#EAF6F0' }}
      aria-label="Contacto"
    >
      {/* Ilustración decorativa — globo */}
      <BalloonDeco />

      {/* Blob decorativo — celeste bebé */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[8%] top-[15%] h-[55%] w-[45%] rounded-[50%] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #BEE3F8 0%, rgba(190,227,248,0.3) 55%, transparent 80%)',
          }}
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
            Contacto
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-[#1B2A41] lg:text-5xl reveal"
            style={{ animationDelay: '90ms' }}
          >
            ¿Tenés una consulta antes de sacar turno?
          </h2>
          <p
            className="mt-6 text-base leading-relaxed text-gray-500 lg:text-lg reveal"
            style={{ animationDelay: '180ms' }}
          >
            Escribinos directo por WhatsApp, la {CLINIC_INFO.doctor} o su
            consultorio te responde a la brevedad.
          </p>

          <div className="mt-10 reveal" style={{ animationDelay: '280ms' }}>
            <a
              href={WHATSAPP_LINK}
              className="inline-flex items-center gap-3 rounded-xl px-10 py-5 text-lg font-semibold text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.97] btn-shine"
              style={{ backgroundColor: '#1B2A41', boxShadow: '0 10px 32px -4px rgba(27,42,65,0.25)' }}
            >
              <MessageCircle className="h-6 w-6 text-[#25D366]" aria-hidden="true" />
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        {/* ── Info cards ── */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div
            className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm reveal"
            style={{ border: '1.5px solid #D9D3F0' }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(190,227,248,0.25)', color: '#1B2A41' }}
            >
              <MapPin className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#1B2A41]">Dirección</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {CLINIC_INFO.address} — {CLINIC_INFO.location}
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm reveal"
            style={{ border: '1.5px solid #D9D3F0', animationDelay: '100ms' }}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'rgba(190,227,248,0.25)', color: '#1B2A41' }}
            >
              <Clock className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#1B2A41]">Horarios</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{CLINIC_INFO.hours}</p>
            </div>
          </div>
        </div>

        {/* ── Mapa ── */}
        {/* TODO (Agus): reemplazar la búsqueda por la dirección exacta del consultorio */}
        <div
          className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl shadow-xl reveal"
          style={{ border: '1.5px solid #BEE3F8', animationDelay: '150ms' }}
        >
          <iframe
            title="Mapa — Consultorio de la Dra. Martinangelio, Pueblo Esther"
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