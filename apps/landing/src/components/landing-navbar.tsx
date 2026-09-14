import { useEffect, useState } from 'react';

import { ENV_URL_ERP } from '../config';

const NAV_LINKS = [
  { label: 'Dra. Martinangelio', href: '#doctora' },
  { label: 'Acompañamiento', href: '#acompanamiento' },
  { label: 'Turnos', href: '#turnos' },
  { label: 'Contacto', href: '#contacto' },
];

/* ── Mancha de fondo del navbar --
   Mismo efecto que la card coral de AboutDoctorSection: blobs #D8552B
   a baja opacidad sangrando por los bordes, recortados por el
   overflow-hidden + rounded del nav. */
function NavBlob({
  className,
  opacity = 0.28,
}: {
  className?: string;
  opacity?: number;
}): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={className} style={{ opacity }}>
      <path
        fill="#D8552B"
        d="M205 8 C288 4 362 62 386 148 C408 228 366 322 288 366 C210 410 108 398 46 330 C-14 264 -6 128 74 54 C112 20 158 10 205 8 Z"
      />
    </svg>
  );
}

/* ── Detecta la sección activa por IntersectionObserver ──────────── */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState('');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-30% 0px -60% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return (): void => {
      observers.forEach((o) => {
        o.disconnect();
      });
    };
  }, [ids]);
  return active;
}

export function LandingNavbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /* ── Detecta si la barra debe flotar como pill (scroll > 16px) ──── */
  useEffect(() => {
    let frame = 0;
    const update = (): void => {
      frame = 0;
      setIsScrolled(window.scrollY > 16);
    };
    const onScroll = (): void => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return (): void => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* IDs de anclas internas para el indicador activo */
  const sectionIds = NAV_LINKS.map((l) => l.href.replace('#', '')).filter(
    (h) => !h.startsWith('http'),
  );
  const activeSection = useActiveSection(sectionIds);

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/*
        -- Barra coral estilo Meelo (referencia 1:1) --
        Estado top: full-width, borde inferior recto con esquinas
        redondeadas (40px) y sombra gris/transparente debajo (se oculta
        con el menú mobile abierto para no ensuciar el panel).
        Estado scrolled: pill flotante centrada (máx 1160px, rounded-full,
        12px de aire, 64px de alto) con sombra más alta. El morph dura
        500ms con una curva suave (0.32, 0.72, 0, 1); la vuelta al estado
        top es más rápida (200ms).
      */}
      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        <nav
          className={`pointer-events-auto relative mx-auto flex items-center justify-between gap-6 overflow-hidden px-4 sm:px-8 lg:px-12 transition-[width,max-width,margin-top,height,border-radius,box-shadow] motion-reduce:transition-none ${
            isScrolled
              ? 'duration-[500ms] ease-[cubic-bezier(0.32,0.72,0,1)] mt-3 h-16 w-[calc(100%-1.5rem)] max-w-[1160px] rounded-full shadow-[0_20px_40px_-12px_rgba(36,29,21,0.45)]'
              : `duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] mt-0 h-[76px] w-full max-w-full rounded-b-[40px] ${
                  isMobileMenuOpen ? 'shadow-none' : 'shadow-[0_8px_18px_-4px_rgba(36,29,21,0.30)]'
                }`
          }`}
          style={{ backgroundColor: '#E96B3A' }}
          aria-label="Navegación principal"
        >
          {/* ── Manchas sutiles de fondo (mismo efecto que la card coral) ── */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <NavBlob className="absolute -left-[5%] -top-[140%] h-[340%] w-[20%]" opacity={0.5} />
            <NavBlob className="absolute left-[30%] -top-[210%] h-[400%] w-[14%]" opacity={0.4} />
            <NavBlob className="absolute -right-[4%] -top-[120%] h-[320%] w-[17%]" opacity={0.48} />
            <NavBlob
              className="absolute right-[27%] -bottom-[240%] h-[380%] w-[15%]"
              opacity={0.42}
            />
          </div>

          {/* ── Logo — wordmark blanco + sonrisa amarilla ── */}
          <a
            href="/"
            className="relative flex shrink-0 flex-col items-start gap-0 cursor-pointer"
            aria-label="Inicio — Consultorio Martinangelio"
          >
            <span className="font-heading text-lg font-bold tracking-tight text-[#241D15] lg:text-xl">
              Consultorio Martinangelio
            </span>
            {/* Sonrisa bajo la primera palabra (como la del logo Meelo) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 120 14"
              className="h-2 w-[112px] lg:w-[120px]"
              fill="none"
            >
              <path
                d="M4 3c16 12 56 12 92 4c6-1.4 14-2 22-1"
                stroke="#F4C43F"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </a>

          {/* ── Desktop links (centrados) ── */}
          <div className="relative hidden lg:flex items-center gap-8 text-[15px] font-medium">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              const isExternal = link.href.startsWith('http');
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative py-1 transition-opacity duration-200 group"
                  style={{ color: '#241D15' }}
                >
                  {link.label}
                  {/* Underline animado — solo en anclas internas */}
                  {!isExternal && (
                    <span
                      className="absolute bottom-0 left-0 h-[2px] rounded-full bg-[#241D15] transition-all duration-300"
                      style={{ width: isActive ? '100%' : '0%', opacity: isActive ? 1 : 0 }}
                    />
                  )}
                  {/* Underline en hover para los no-activos */}
                  {!isExternal && !isActive && (
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-[#241D15]/70 transition-all duration-200 group-hover:w-full" />
                  )}
                </a>
              );
            })}
          </div>

          {/* ── CTA desktop — pill mostaza ── */}
          <div className="relative hidden md:block shrink-0">
            <a
              href={`${ENV_URL_ERP}/register`}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-[14px] font-semibold text-[#241D15] transition-all duration-200 hover:scale-[1.03] hover:brightness-105 active:scale-[0.97]"
              style={{ backgroundColor: '#F4C43F' }}
            >
              Portal del paciente
            </a>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="relative lg:hidden w-10 h-10 -mr-1 flex items-center justify-center rounded-full text-[#241D15] transition-colors duration-200 hover:bg-black/5"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
          >
            {/* Icono animado hamburger ? X */}
            <span className="block w-5 relative" style={{ height: '16px' }}>
              <span
                className="absolute left-0 h-[2px] w-5 rounded-full bg-[#241D15] transition-all duration-250 origin-center"
                style={{
                  top: isMobileMenuOpen ? '7px' : '0px',
                  transform: isMobileMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              />
              <span
                className="absolute left-0 top-[7px] h-[2px] rounded-full bg-[#241D15] transition-all duration-200"
                style={{
                  width: isMobileMenuOpen ? '0px' : '20px',
                  opacity: isMobileMenuOpen ? 0 : 1,
                }}
              />
              <span
                className="absolute left-0 h-[2px] w-5 rounded-full bg-[#241D15] transition-all duration-250 origin-center"
                style={{
                  top: isMobileMenuOpen ? '7px' : '14px',
                  transform: isMobileMenuOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                }}
              />
            </span>
          </button>
        </nav>

        {/* ── Mobile dropdown ── */}
        <div
          id="mobile-menu"
          aria-hidden={!isMobileMenuOpen}
          className={`pointer-events-auto transition-all duration-300 ease-out ${
            isMobileMenuOpen
              ? 'visible opacity-100 translate-y-0'
              : 'invisible opacity-0 -translate-y-2'
          }`}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal"
            className={`mx-auto p-6 transition-[width,max-width,margin-top,border-radius] motion-reduce:transition-none ${
              isScrolled
                ? 'duration-[500ms] ease-[cubic-bezier(0.32,0.72,0,1)] mt-2 w-[calc(100%-1.5rem)] max-w-[1160px] rounded-[28px] shadow-[0_20px_40px_-12px_rgba(36,29,21,0.45)]'
                : 'duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)] mt-0 w-full max-w-full rounded-b-[40px] shadow-[0_8px_18px_-4px_rgba(36,29,21,0.30)]'
            }`}
            style={{ backgroundColor: '#E96B3A' }}
          >
            {NAV_LINKS.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-full px-4 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:bg-white/10"
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {isActive && (
                    <span
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: '#F4C43F' }}
                    />
                  )}
                  {link.label}
                </a>
              );
            })}

            <div className="mt-4 flex flex-col gap-3">
              <a
                href={`${ENV_URL_ERP}/login`}
                onClick={closeMobileMenu}
                className="text-center rounded-full px-6 py-3 text-[13px] font-medium text-white transition-all duration-200 hover:bg-white/10"
                style={{ border: '1.5px solid rgba(255,255,255,0.4)' }}
              >
                Iniciar sesión
              </a>
              <a
                href={`${ENV_URL_ERP}/register`}
                onClick={closeMobileMenu}
                className="text-center rounded-full px-6 py-3 text-[13px] font-semibold text-[#241D15] transition-all active:scale-[0.97]"
                style={{ backgroundColor: '#F4C43F' }}
              >
                Portal del paciente
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── Spacer — compensa la barra fixed full-width ── */}
      <div style={{ height: '76px' }} aria-hidden="true" />
    </>
  );
}
