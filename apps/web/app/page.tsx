import Image from 'next/image';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────
   INLINE SVG ICONS
   ───────────────────────────────────────────────────────────────────────── */

function PlusCircleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#6366f1" />
      <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HEADER
   ───────────────────────────────────────────────────────────────────────── */

function Header() {
  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Quiénes Somos', href: '#nosotros' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Contacto', href: '#contacto' },
    { label: 'Portal de Pacientes', href: '/turnos' },
    { label: 'Agendar Cita', href: '#agendar' },
  ];

  return (
    <header className="relative z-50 bg-white">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-6 lg:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="iPediERP — inicio">
          <PlusCircleIcon />
          <span className="text-[15px] font-bold tracking-tight text-slate-800">iPediERP</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-brand-600"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="#contacto"
          id="header-contact-cta"
          className="rounded-full bg-brand px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-brand-600 active:scale-[0.97]"
        >
          Contáctanos
        </Link>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HERO — BADGE COMPONENTS
   ───────────────────────────────────────────────────────────────────────── */

/** "Atención al Niño" — dark indigo badge */
function BadgeChildCare() {
  return (
    <div className="flex items-center gap-2 rounded-full bg-[#3730a3] px-3.5 py-2 shadow-xl">
      {/* Hand icon */}
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/80">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V17a6 6 0 0 0 12 0v-5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
        </svg>
      </span>
      <span className="text-[13px] font-semibold leading-tight text-white">
        Atención<br />al Niño
      </span>
      {/* Person icon */}
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/80">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      </span>
    </div>
  );
}

/** "Atención Médica Integral" — teal badge */
function BadgeMedicalCare() {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-[#0d9488] px-3.5 py-2 shadow-xl">
      {/* Building/clinic icon */}
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="9" width="18" height="12" rx="1" /><path d="M8 21V9" /><path d="M16 21V9" /><path d="M3 9l9-6 9 6" /><path d="M12 3v6" /><path d="M9 12h6" /><path d="M12 12v3" />
        </svg>
      </span>
      <span className="text-[13px] font-semibold text-white">Atención Médica Integral</span>
      {/* Stethoscope icon */}
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15a6 6 0 0 0 6 6" /><circle cx="20" cy="21" r="1" /><path d="M20 16v4" />
        </svg>
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-white"
      aria-label="Cuidado pediátrico integral"
    >
      <div className="mx-auto grid min-h-[calc(100vh-60px-32px)] max-w-[1200px] grid-cols-1 items-center gap-0 px-6 lg:grid-cols-[1fr_1.1fr] lg:px-10">

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div className="flex flex-col gap-7 py-16 lg:py-0">

          {/* H1 */}
          <h1 className="text-[2.6rem] font-bold leading-[1.1] tracking-tight lg:text-[3rem]">
            <span className="text-brand">Cuidado Pediátrico</span>
            <br />
            <span className="text-slate-900">Integral y Excelencia</span>
            <br />
            <span className="text-slate-900">Médica</span>
            <br />
            <span className="text-slate-900">Comienzan Aquí</span>
          </h1>

          {/* Stat + description */}
          <div className="flex items-start gap-5">
            {/* 98% block */}
            <div className="flex-shrink-0">
              <p className="text-[2.8rem] font-bold leading-none text-slate-900">98%</p>
              <p className="mt-1 text-[13px] font-medium leading-snug text-slate-700">
                Padres<br />Satisfechos
              </p>
            </div>
            {/* Description */}
            <p className="mt-1 max-w-[220px] text-[12.5px] leading-relaxed text-slate-500">
              Ofreciendo atención pediátrica integral con médicos especializados,
              tecnología de vanguardia y un compromiso absoluto con el bienestar de su hijo.
            </p>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="#agendar"
              id="hero-cta-reserve"
              className="inline-flex items-center rounded-full bg-brand px-8 py-3 text-[14px] font-semibold text-white shadow-md shadow-brand/30 transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand/30 active:scale-[0.97]"
            >
              Reservar Cita
            </Link>
          </div>
        </div>

        {/* ════════════ RIGHT COLUMN — Image & Graphics ════════════ */}
        <div className="relative flex min-h-[600px] items-end justify-center lg:min-h-[calc(100vh-60px)]">

          {/* ── Large organic cyan blob (main backdrop) ── */}
          <div
            aria-hidden="true"
            className="absolute right-[-8%] top-[2%] h-[92%] w-[88%] bg-[#b2f0ee]"
            style={{
              borderRadius: '62% 38% 45% 55% / 48% 42% 58% 52%',
            }}
          />

          {/* ── Secondary smaller cyan circle (top-left of blob area) ── */}
          <div
            aria-hidden="true"
            className="absolute left-[15%] top-[8%] h-[80px] w-[80px] rounded-full bg-[#b2f0ee] opacity-80"
          />

          {/* ── Tiny circle (top-right accent) ── */}
          <div
            aria-hidden="true"
            className="absolute right-[8%] top-[12%] h-[40px] w-[40px] rounded-full bg-[#80deea] opacity-60"
          />

          {/* ── Small red/coral dot ── */}
          <div
            aria-hidden="true"
            className="absolute right-[3%] top-[42%] h-[10px] w-[10px] rounded-full bg-rose-400"
          />

          {/* ── Badge 1: "Atención al Niño" (upper, floating) ── */}
          <div
            className="absolute left-[12%] top-[30%] z-20 animate-float-badge"
            aria-hidden="true"
          >
            <BadgeChildCare />
          </div>

          {/* ── Badge 2: "Atención Médica Integral" (lower, floating) ── */}
          <div
            className="absolute bottom-[22%] left-[5%] z-20 animate-float-badge-delay"
            aria-hidden="true"
          >
            <BadgeMedicalCare />
          </div>

          {/* ── Doctor image (hero, centered on blob) ── */}
          <div className="relative z-10 h-full w-full max-w-[640px]">
            <Image
              src="/doctora_landing.PNG"
              alt="Dra. Martins — Pediatra especialista"
              width={640}
              height={860}
              className="h-full w-full object-contain object-bottom"
              style={{
                maskImage: 'linear-gradient(to bottom, black 94%, transparent 99%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 94%, transparent 99%)',
              }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FOOTER BAR
   ───────────────────────────────────────────────────────────────────────── */

function FooterBar() {
  return (
    <footer className="relative h-8 bg-[#0f0a30]" aria-label="Pie de página">
      {/* Small purple star bottom-right */}
      <div className="absolute bottom-1.5 right-4" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#7c3aed" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'iPediERP — Cuidado Pediátrico Integral y Excelencia Médica',
  description:
    'Atención pediátrica integral con médicos especializados, tecnología de vanguardia y un compromiso absoluto con el bienestar de su hijo. Reservá tu cita online.',
  keywords: ['clínica pediátrica', 'pediatra', 'turno pediátrico', 'salud infantil', 'iPediERP'],
  robots: { index: true, follow: true },
};

export default function LandingPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
      </main>
      <FooterBar />
    </div>
  );
}
