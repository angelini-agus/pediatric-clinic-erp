const APP_BASE_URL = 'http://localhost:3000';

/**
 * iPediERP Landing — Navbar.
 *
 * Aesthetic: ERP glassmorphism style — white/translucent with backdrop-blur,
 * violet accent logo, subtle border.
 */
export function LandingHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[66px] max-w-7xl items-center justify-between gap-6 px-5 lg:px-10">

        {/* ── Brand ── */}
        <a
          href="/"
          className="flex flex-shrink-0 items-center gap-2.5 group"
          aria-label="Inicio — iPediERP"
        >
          {/* Purple square logo with + */}
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-xl font-bold shadow-sm transition-all group-hover:bg-brand-600 group-hover:shadow-md"
            aria-hidden="true"
          >
            +
          </span>
          <span className="text-[1.1rem] font-bold tracking-tight text-slate-800">
            iPediERP
          </span>
        </a>

        {/* ── Center nav (hidden on mobile) ── */}
        <nav className="hidden md:flex items-center gap-0.5" aria-label="Navegación principal">
          {[
            { label: 'Inicio', href: '/' },
            { label: 'Quiénes Somos', href: '#nosotros' },
            { label: 'Servicios', href: '#servicios' },
            { label: 'Contacto', href: '#contacto' },
            { label: 'Portal de Pacientes', href: `${APP_BASE_URL}/turnos` },
            { label: 'Agendar Cita', href: '#agendar' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Right CTA ── */}
        <a
          href="#contacto"
          id="header-contact-cta"
          className="flex-shrink-0 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md active:scale-[0.97]"
        >
          Contáctanos
        </a>
      </div>
    </header>
  );
}