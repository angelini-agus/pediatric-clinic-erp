import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const APP_BASE_URL = 'http://localhost:3000';

const NAV_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Pediatras', href: '#pediatras' },
  { label: 'Turnos', href: `${APP_BASE_URL}/register` },
  { label: 'Contacto', href: '#contacto' },
];

export function LandingNavbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="w-full max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between shrink-0">
      {/* Logo */}
      <a href="/" className="flex items-center gap-3 cursor-pointer" aria-label="Inicio — iPediERP">
        <div className="w-10 h-10 rounded-2xl bg-white/90 shadow-md flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 text-[#1F6BFF]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 10.5h-6.5V4h-3v6.5H4v3h6.5V20h3v-6.5H20v-3z" />
          </svg>
        </div>
        <span className="font-display text-2xl font-bold tracking-tight text-[#0B1120]">iPediERP</span>
      </a>

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-8 text-base font-medium text-gray-700">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="hover:text-[#1F6BFF] flex items-center gap-1 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA — Portal del Paciente */}
      <div className="hidden md:block">
        <a
          href={`${APP_BASE_URL}/register`}
          className="bg-[#0B1120] text-white px-7 py-3 rounded-full text-base font-semibold hover:bg-gray-800 transition shadow-lg shadow-gray-400/20"
        >
          Portal del Paciente
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="lg:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-[#0B1120] hover:bg-black/5 transition-colors"
        aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
        onClick={() => {
          setIsMobileMenuOpen(!isMobileMenuOpen);
        }}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" strokeWidth={2} />
        ) : (
          <Menu className="w-6 h-6" strokeWidth={2} />
        )}
      </button>

      {/* Mobile menu — Side Drawer */}
      <div
        id="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-50 flex justify-end lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Drawer panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          className={`w-[80%] max-w-sm h-full bg-white shadow-2xl flex flex-col pt-20 px-6 gap-6 transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMobileMenu}
              className="text-[15px] font-medium text-gray-800 hover:text-[#1F6BFF] transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="mt-auto pb-10 flex flex-col gap-3">
            <a
              href={`${APP_BASE_URL}/login`}
              onClick={closeMobileMenu}
              className="text-center px-6 py-3 rounded-full text-[13px] font-medium text-[#0B1120] border border-[#0B1120] hover:bg-[#0B1120] hover:text-white transition"
            >
              Iniciar sesión
            </a>
            <a
              href={`${APP_BASE_URL}/register`}
              onClick={closeMobileMenu}
              className="text-center bg-[#0B1120] text-white px-6 py-3 rounded-full text-[13px] font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-400/20"
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}