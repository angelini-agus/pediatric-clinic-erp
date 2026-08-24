import { ENV_URL_ERP } from '../config';

const FOOTER_LINKS = [
  { label: 'Sobre la Dra.', href: '#doctora' },
  { label: 'Acompañamiento', href: '#acompanamiento' },
  { label: 'Turnos', href: '#turnos' },
  { label: 'Contacto', href: '#contacto' },
];

export function LandingFooter(): React.JSX.Element {
  return (
    <footer className="bg-[#0F1C36] text-slate-300" aria-label="Pie de página">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* ── Brand ── */}
          <div className="max-w-sm reveal" style={{ animationDelay: '100ms' }}>
            <a href="/" className="flex items-center gap-3" aria-label="Inicio — iPediERP">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 shadow-md">
                <svg
                  className="h-6 w-6 text-[#4a90ff]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20 10.5h-6.5V4h-3v6.5H4v3h6.5V20h3v-6.5H20v-3z" />
                </svg>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                iPediERP
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Consultorio de la Dra. Martinangelio — Pediatría en Pueblo Esther.
            </p>
            {/* REEMPLAZAR: agregar redes sociales de la Dra. cuando existan (ej. Instagram, Facebook) */}
          </div>

          {/* ── Nav ── */}
          <nav aria-label="Navegación del pie de página" className="reveal" style={{ animationDelay: '200ms' }}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Secciones
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── CTA ── */}
          <div className="flex flex-col items-start gap-4 reveal" style={{ animationDelay: '300ms' }}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Turnos online
            </h3>
            <a
              href={`${ENV_URL_ERP}/register`}
              className="inline-flex items-center rounded-xl bg-[#1F6BFF] px-7 py-3 text-base font-semibold text-white shadow-lg shadow-[#1F6BFF]/25 transition-all hover:bg-[#1a5ee8] active:scale-[0.97] btn-shine"
            >
              Portal del paciente
            </a>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row reveal" style={{ animationDelay: '400ms' }}>
          <p>© {new Date().getFullYear()} iPediERP — Todos los derechos reservados.</p>
          <p>Dra. Martinangelio · Pueblo Esther, Santa Fe</p>
        </div>
      </div>
    </footer>
  );
}