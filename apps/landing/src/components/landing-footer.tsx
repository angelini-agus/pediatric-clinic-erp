import { ArrowUp, Clock, MapPin, MessageCircle } from 'lucide-react';

import { CLINIC_INFO, ENV_URL_ERP, WHATSAPP_LINK } from '../config';

const FOOTER_LINKS = [
  { label: 'Sobre la Dra.', href: '#doctora' },
  { label: 'Acompañamiento', href: '#acompanamiento' },
  { label: 'Preguntas frecuentes', href: '#faq' },
  { label: 'Turnos', href: '#turnos' },
  { label: 'Contacto', href: '#contacto' },
];

export function LandingFooter(): React.JSX.Element {
  return (
    <footer
      className="text-white/80"
      style={{
        backgroundColor: '#241D15',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
      aria-label="Pie de página"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {/* ── Brand ── */}
          <div className="max-w-sm reveal" style={{ animationDelay: '100ms' }}>
            <a
              href="/"
              className="flex flex-col items-start gap-0"
              aria-label={`Inicio — ${CLINIC_INFO.brand}`}
            >
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                {CLINIC_INFO.brand}
              </span>
              {/* Sonrisa del logo (misma que el navbar) */}
              <svg aria-hidden="true" viewBox="0 0 120 14" className="h-2 w-[78px]" fill="none">
                <path
                  d="M4 3c16 12 56 12 92 4c6-1.4 14-2 22-1"
                  stroke="#F4C43F"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </a>
            <p className="mt-2 text-sm font-semibold text-white/80">{CLINIC_INFO.descriptor}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Pediatría con seguimiento continuo: la misma médica desde la preconcepción hasta la
              adolescencia.
            </p>
            {/* REEMPLAZAR: agregar redes sociales de la Dra. cuando existan (ej. Instagram, Facebook) */}
          </div>

          {/* ── Contacto ── */}
          <div className="reveal" style={{ animationDelay: '160ms' }}>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Contacto
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <span>
                  {CLINIC_INFO.address} — {CLINIC_INFO.location}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <span>{CLINIC_INFO.hours}</span>
              </li>
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-white"
                >
                  <MessageCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-white/40"
                    aria-hidden="true"
                  />
                  <span>Escribinos por WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* ── Nav ── */}
          <nav
            aria-label="Navegación del pie de página"
            className="reveal"
            style={{ animationDelay: '220ms' }}
          >
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Secciones
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── CTA ── */}
          <div
            className="flex flex-col items-start gap-4 reveal"
            style={{ animationDelay: '280ms' }}
          >
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Turnos online
            </h3>
            <a
              href={`${ENV_URL_ERP}/register`}
              className="inline-flex items-center rounded-full bg-white px-7 py-3 text-base font-semibold text-[#241D15] shadow-lg transition-all hover:brightness-105 active:scale-[0.97] btn-shine"
            >
              Portal del paciente
            </a>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:pr-20 reveal"
          style={{ animationDelay: '360ms' }}
        >
          <p>
            © {new Date().getFullYear()} {CLINIC_INFO.brand} — {CLINIC_INFO.descriptor}. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-5">
            {/* TODO (Agus): reemplazar [MP] por el número de matrícula real */}
            <p>MP [MP] · Pueblo Esther, Santa Fe</p>
            <a
              href="#top"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              Volver arriba
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
