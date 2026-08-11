import Link from 'next/link';

export function PublicNavbar(): React.JSX.Element {
  return (
    <header className="public-navbar">
      <div className="public-navbar__inner">
        {/* Logo / Nombre de la clínica */}
        <Link href="/" className="public-navbar__brand" aria-label="Inicio — PediCare Clínica Pediátrica">
          <span className="public-navbar__brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="14" fill="hsl(210, 90%, 52%)" />
              <path
                d="M14 6.5C14 6.5 8 10.5 8 15.5C8 18.814 10.686 21.5 14 21.5C17.314 21.5 20 18.814 20 15.5C20 10.5 14 6.5 14 6.5Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path d="M11.5 14.5H16.5M14 12V17" stroke="hsl(210, 90%, 52%)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="public-navbar__brand-text">
            <span className="public-navbar__brand-name">PediCare</span>
            <span className="public-navbar__brand-tagline">Clínica Pediátrica</span>
          </span>
        </Link>

        {/* Nav links desktop */}
        <nav className="public-navbar__nav" aria-label="Navegación principal">
          <Link href="#servicios" className="public-navbar__nav-link">Servicios</Link>
          <Link href="#nosotros" className="public-navbar__nav-link">Nosotros</Link>
          <Link href="#contacto" className="public-navbar__nav-link">Contacto</Link>
        </nav>

        {/* CTA: Acceso médico */}
        <div className="public-navbar__actions">
          <Link
            href="/login"
            className="public-navbar__btn-medical"
            id="nav-medical-access"
            aria-label="Acceso al portal del personal médico"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Acceso Personal Médico
          </Link>
        </div>
      </div>
    </header>
  );
}
