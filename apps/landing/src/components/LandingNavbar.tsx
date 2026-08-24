import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const APP_BASE_URL = 'http://localhost:3000';

const NAV_LINKS = [
  { label: 'Dra. Martinangelio', href: '#doctora' },
  { label: 'Acompañamiento', href: '#acompanamiento' },
  { label: 'Turnos', href: `${APP_BASE_URL}/register` },
  { label: 'Contacto', href: '#contacto' },
];

/* ── Detecta la sección activa por IntersectionObserver ──────────── */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);
  return active;
}

export function LandingNavbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  /* IDs de anclas internas para el indicador activo */
  const sectionIds = NAV_LINKS.map((l) => l.href.replace('#', '')).filter((h) => !h.startsWith('http'));
  const activeSection = useActiveSection(sectionIds);

  /* Scroll: detecta dirección + si ya pasó el hero */
  useEffect(() => {
    const onScroll = (): void => {
      const y = window.scrollY;
      setScrolled(y > 40);
      /* Oculta al bajar rápido, muestra al subir */
      setVisible(y < lastY.current || y < 80);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileMenu = (): void => setIsMobileMenuOpen(false);

  return (
    <>
      {/*
        ── Barra fija ──────────────────────────────────────────────────────────
        - Transparente al top (sobre el hero menta)
        - Glass blur + sombra suave al hacer scroll
        - Se oculta/muestra con la dirección del scroll (hide-on-down)
      */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          /* Al hacer scroll: fondo glass blanco/menta muy transparente + blur */
          background: scrolled
            ? 'rgba(234,246,240,0.82)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.4)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(190,227,248,0.35)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 24px -4px rgba(27,42,65,0.08)' : 'none',
        }}
      >
        <nav
          className="w-full max-w-[1400px] mx-auto px-6 flex items-center justify-between load-drop"
          style={{ height: scrolled ? '60px' : '72px', transition: 'height 0.3s ease' }}
        >
          {/* ── Logo ── */}
          <a
            href="/"
            className="flex items-center gap-3 cursor-pointer"
            aria-label="Inicio — iPediERP"
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
              style={{
                background: scrolled ? 'rgba(27,42,65,0.08)' : 'rgba(255,255,255,0.90)',
                boxShadow: scrolled ? 'none' : '0 2px 12px -2px rgba(27,42,65,0.12)',
              }}
            >
              <svg className="w-5 h-5 text-[#1F6BFF]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 10.5h-6.5V4h-3v6.5H4v3h6.5V20h3v-6.5H20v-3z" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#1B2A41]">
              iPediERP
            </span>
          </a>

          {/* ── Desktop links ── */}
          <div className="hidden lg:flex items-center gap-7 text-[15px] font-medium">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              const isExternal = link.href.startsWith('http');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative py-1 transition-colors duration-200 group"
                  style={{ color: isActive ? '#1B2A41' : '#4a5568' }}
                >
                  {link.label}
                  {/* Underline animado — solo en anclas internas */}
                  {!isExternal && (
                    <span
                      className="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? '100%' : '0%',
                        background: 'linear-gradient(to right, #BEE3F8, #D9D3F0)',
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                  )}
                  {/* Underline en hover para los no-activos */}
                  {!isExternal && !isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-[#BEE3F8] transition-all duration-200 group-hover:w-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* ── CTA desktop ── */}
          <div className="hidden md:block">
            <a
              href={`${APP_BASE_URL}/register`}
              className="relative inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white overflow-hidden transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] btn-shine"
              style={{
                background: 'linear-gradient(135deg, #1B2A41 0%, #2d4166 100%)',
                boxShadow: '0 2px 16px -2px rgba(27,42,65,0.30)',
              }}
            >
              Portal del paciente
            </a>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="lg:hidden w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-[#1B2A41] transition-colors duration-200 hover:bg-black/5"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {/* Icono animado hamburger → X */}
            <span
              className="block w-5 relative"
              style={{ height: '16px' }}
            >
              <span
                className="absolute left-0 h-[2px] w-5 rounded-full bg-[#1B2A41] transition-all duration-250 origin-center"
                style={{
                  top: isMobileMenuOpen ? '7px' : '0px',
                  transform: isMobileMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              />
              <span
                className="absolute left-0 top-[7px] h-[2px] rounded-full bg-[#1B2A41] transition-all duration-200"
                style={{
                  width: isMobileMenuOpen ? '0px' : '20px',
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="absolute left-0 h-[2px] w-5 rounded-full bg-[#1B2A41] transition-all duration-250 origin-center"
                style={{
                  top: isMobileMenuOpen ? '7px' : '14px',
                  transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                }}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* ── Spacer — empuja el contenido debajo del header fijo ── */}
      <div style={{ height: '72px' }} aria-hidden="true" />

      {/* ── Mobile drawer ── */}
      <div
        id="mobile-menu"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-40 flex justify-end lg:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
          className={`absolute inset-0 transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'rgba(27,42,65,0.45)', backdropFilter: 'blur(4px)' }}
        />

        {/* Panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú principal"
          className={`w-[80%] max-w-sm h-full shadow-2xl flex flex-col pt-24 px-6 gap-2 transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ background: 'rgba(234,246,240,0.97)', backdropFilter: 'blur(20px)' }}
        >
          {NAV_LINKS.map((link) => {
            const id = link.href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all duration-200"
                style={{
                  color: isActive ? '#1B2A41' : '#4a5568',
                  background: isActive ? 'rgba(190,227,248,0.35)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'linear-gradient(to bottom, #BEE3F8, #D9D3F0)' }}
                  />
                )}
                {link.label}
              </a>
            );
          })}

          <div className="mt-auto pb-10 flex flex-col gap-3">
            <a
              href={`${APP_BASE_URL}/login`}
              onClick={closeMobileMenu}
              className="text-center px-6 py-3 rounded-xl text-[13px] font-medium text-[#1B2A41] transition-all hover:bg-[#1B2A41]/8"
              style={{ border: '1.5px solid rgba(27,42,65,0.2)' }}
            >
              Iniciar sesión
            </a>
            <a
              href={`${APP_BASE_URL}/register`}
              onClick={closeMobileMenu}
              className="text-center px-6 py-3 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #1B2A41 0%, #2d4166 100%)',
                boxShadow: '0 4px 16px -2px rgba(27,42,65,0.25)',
              }}
            >
              Crear cuenta
            </a>
          </div>
        </div>
      </div>
    </>
  );
}