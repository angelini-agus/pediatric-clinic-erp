import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

/* ─────────────────────────────────────────────────────────────────────────
   SEO METADATA
   ───────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'iPediERP — Cuidado Pediátrico Integral y Excelencia Médica',
  description:
    'Atención pediátrica integral con médicos especializados, tecnología de vanguardia y un compromiso absoluto con el bienestar de su hijo. Reservá tu cita online.',
  keywords: ['clínica pediátrica', 'pediatra', 'turno pediátrico', 'salud infantil', 'iPediERP'],
  robots: { index: true, follow: true },
};

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
   SVG DECORATIVE LAYERS — TOPOGRAPHIC LINES
   Concentric wavy contour lines peeking from the left side
   ───────────────────────────────────────────────────────────────────────── */

function SvgTopographicLines() {
  return (
    <svg
      viewBox="0 0 260 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute -left-4 top-[10%] h-[75%] w-auto opacity-30"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Concentric wavy topographic lines */}
      <path
        d="M-10 240 C20 180, 60 210, 80 170 C100 130, 80 90, 120 60 C160 30, 200 50, 240 40"
        stroke="#2dd4bf"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M-10 270 C30 200, 70 240, 100 195 C130 150, 110 110, 155 80 C200 50, 230 70, 260 60"
        stroke="#2dd4bf"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M-10 300 C40 220, 80 270, 120 220 C160 170, 140 130, 190 100 C240 70, 250 90, 270 80"
        stroke="#2dd4bf"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M-10 330 C50 240, 90 300, 140 245 C190 190, 170 150, 225 120 C250 105, 260 115, 270 110"
        stroke="#14b8a6"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M-10 360 C55 260, 100 330, 155 270 C210 210, 195 170, 250 145"
        stroke="#14b8a6"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M-10 390 C60 290, 115 365, 175 300 C225 240, 220 200, 265 175"
        stroke="#0d9488"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M-10 200 C20 160, 50 175, 75 140 C100 105, 85 70, 125 45 C165 20, 205 40, 245 30"
        stroke="#5eead4"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M-10 170 C15 140, 45 155, 65 115 C85 75, 70 45, 110 20 C150 -5, 200 15, 240 5"
        stroke="#5eead4"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M-10 420 C65 320, 125 395, 190 330 C240 270, 240 235, 275 210"
        stroke="#0d9488"
        strokeWidth="0.6"
        fill="none"
      />
      {/* Subtle fill patches between lines for topographic depth */}
      <path
        d="M-10 240 C20 180,60 210,80 170 C100 130,80 90,120 60 C160 30,200 50,240 40 L240 5 C200 15,150 -5,110 20 C70 45,85 75,65 115 C45 155,15 140,-10 170Z"
        fill="#ccfbf1"
        fillOpacity="0.25"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG DECORATIVE LAYERS — DOT MATRIX
   Data grid of subtle dots on the right side
   ───────────────────────────────────────────────────────────────────────── */

function SvgDotMatrix() {
  const dots: { cx: number; cy: number; r: number }[] = [];
  const cols = 10;
  const rows = 14;
  const spacing = 22;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * spacing + 11;
      const cy = row * spacing + 11;
      // Vary radius for organic feel
      const r = (col + row) % 3 === 0 ? 1.8 : (col + row) % 3 === 1 ? 1.2 : 0.8;
      dots.push({ cx, cy, r });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols * spacing} ${rows * spacing}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute -right-2 top-[8%] h-[60%] w-auto opacity-35"
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill={i % 4 === 0 ? '#6366f1' : '#2dd4bf'}
          fillOpacity={i % 5 === 0 ? '0.9' : '0.6'}
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG DECORATIVE LAYERS — MOLECULAR NODES (top)
   Abstract network of circles connected by fine lines — upper area
   ───────────────────────────────────────────────────────────────────────── */

function SvgMolecularNodesTop() {
  return (
    <svg
      viewBox="0 0 340 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute right-[5%] top-0 h-auto w-[55%] opacity-25"
    >
      {/* Connector lines */}
      <line x1="40" y1="40" x2="120" y2="25" stroke="#2dd4bf" strokeWidth="1" />
      <line x1="120" y1="25" x2="200" y2="60" stroke="#2dd4bf" strokeWidth="1" />
      <line x1="200" y1="60" x2="290" y2="35" stroke="#6366f1" strokeWidth="1" />
      <line x1="290" y1="35" x2="320" y2="100" stroke="#6366f1" strokeWidth="0.8" />
      <line x1="120" y1="25" x2="160" y2="100" stroke="#2dd4bf" strokeWidth="0.8" />
      <line x1="200" y1="60" x2="160" y2="100" stroke="#14b8a6" strokeWidth="0.8" />
      <line x1="160" y1="100" x2="240" y2="130" stroke="#14b8a6" strokeWidth="1" />
      <line x1="240" y1="130" x2="320" y2="100" stroke="#6366f1" strokeWidth="0.8" />
      <line x1="40" y1="40" x2="80" y2="130" stroke="#2dd4bf" strokeWidth="0.8" />
      <line x1="80" y1="130" x2="160" y2="100" stroke="#2dd4bf" strokeWidth="0.8" />
      <line x1="80" y1="130" x2="240" y2="130" stroke="#14b8a6" strokeWidth="0.6" />

      {/* Node circles — large */}
      <circle cx="40" cy="40" r="7" fill="#14b8a6" fillOpacity="0.8" />
      <circle cx="120" cy="25" r="9" fill="#0d9488" fillOpacity="0.9" />
      <circle cx="200" cy="60" r="8" fill="#2dd4bf" fillOpacity="0.8" />
      <circle cx="290" cy="35" r="6" fill="#6366f1" fillOpacity="0.7" />
      <circle cx="320" cy="100" r="5" fill="#4f46e5" fillOpacity="0.7" />
      <circle cx="160" cy="100" r="10" fill="#14b8a6" fillOpacity="0.6" />
      <circle cx="80" cy="130" r="7" fill="#2dd4bf" fillOpacity="0.7" />
      <circle cx="240" cy="130" r="8" fill="#6366f1" fillOpacity="0.6" />

      {/* Node inner highlights */}
      <circle cx="40" cy="40" r="3" fill="white" fillOpacity="0.6" />
      <circle cx="120" cy="25" r="4" fill="white" fillOpacity="0.5" />
      <circle cx="160" cy="100" r="5" fill="white" fillOpacity="0.4" />
      <circle cx="200" cy="60" r="3" fill="white" fillOpacity="0.5" />

      {/* Small satellite dots */}
      <circle cx="70" cy="18" r="2.5" fill="#5eead4" fillOpacity="0.8" />
      <circle cx="250" cy="15" r="2" fill="#a5f3fc" fillOpacity="0.8" />
      <circle cx="310" cy="155" r="3" fill="#818cf8" fillOpacity="0.7" />
      <circle cx="20" cy="110" r="2" fill="#2dd4bf" fillOpacity="0.7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SVG DECORATIVE LAYERS — MOLECULAR NODES (bottom)
   Abstract network — lower area
   ───────────────────────────────────────────────────────────────────────── */

function SvgMolecularNodesBottom() {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute bottom-[4%] left-[2%] h-auto w-[50%] opacity-20"
    >
      {/* Lines */}
      <line x1="30" y1="130" x2="110" y2="100" stroke="#2dd4bf" strokeWidth="1" />
      <line x1="110" y1="100" x2="190" y2="130" stroke="#14b8a6" strokeWidth="1" />
      <line x1="190" y1="130" x2="280" y2="110" stroke="#6366f1" strokeWidth="0.8" />
      <line x1="110" y1="100" x2="150" y2="40" stroke="#2dd4bf" strokeWidth="0.8" />
      <line x1="150" y1="40" x2="230" y2="60" stroke="#14b8a6" strokeWidth="1" />
      <line x1="230" y1="60" x2="280" y2="110" stroke="#6366f1" strokeWidth="0.8" />
      <line x1="30" y1="130" x2="60" y2="60" stroke="#2dd4bf" strokeWidth="0.6" />
      <line x1="60" y1="60" x2="150" y2="40" stroke="#14b8a6" strokeWidth="0.8" />
      <line x1="190" y1="130" x2="230" y2="60" stroke="#6366f1" strokeWidth="0.6" />

      {/* Nodes */}
      <circle cx="30" cy="130" r="6" fill="#14b8a6" fillOpacity="0.8" />
      <circle cx="110" cy="100" r="9" fill="#0d9488" fillOpacity="0.9" />
      <circle cx="190" cy="130" r="7" fill="#2dd4bf" fillOpacity="0.8" />
      <circle cx="280" cy="110" r="5" fill="#6366f1" fillOpacity="0.7" />
      <circle cx="150" cy="40" r="8" fill="#14b8a6" fillOpacity="0.7" />
      <circle cx="230" cy="60" r="6" fill="#6366f1" fillOpacity="0.6" />
      <circle cx="60" cy="60" r="5" fill="#2dd4bf" fillOpacity="0.7" />

      {/* Inner highlights */}
      <circle cx="110" cy="100" r="4" fill="white" fillOpacity="0.45" />
      <circle cx="150" cy="40" r="3" fill="white" fillOpacity="0.45" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HERO — BADGE COMPONENTS
   ───────────────────────────────────────────────────────────────────────── */

/** "Atención al Niño" — dark indigo badge glassmorphism */
function BadgeChildCare() {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-3.5 py-2 shadow-xl"
      style={{
        background: 'rgba(55, 48, 163, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(129, 140, 248, 0.3)',
        boxShadow: '0 8px 32px rgba(67, 56, 202, 0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Hand icon */}
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'rgba(99, 102, 241, 0.6)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V17a6 6 0 0 0 12 0v-5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2" />
        </svg>
      </span>
      <span className="text-[13px] font-semibold leading-tight text-white">
        Atención<br />al Niño
      </span>
      {/* Person icon */}
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'rgba(99, 102, 241, 0.6)' }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      </span>
    </div>
  );
}

/** "Atención Médica Integral" — teal glassmorphism badge */
function BadgeMedicalCare() {
  return (
    <div
      className="flex items-center gap-2.5 rounded-full px-3.5 py-2 shadow-xl"
      style={{
        background: 'rgba(13, 148, 136, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(94, 234, 212, 0.35)',
        boxShadow: '0 8px 32px rgba(20, 184, 166, 0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Building/clinic icon */}
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="9" width="18" height="12" rx="1" />
          <path d="M8 21V9" />
          <path d="M16 21V9" />
          <path d="M3 9l9-6 9 6" />
          <path d="M12 3v6" />
          <path d="M9 12h6" />
          <path d="M12 12v3" />
        </svg>
      </span>
      <span className="text-[13px] font-semibold text-white">Atención Médica Integral</span>
      {/* Stethoscope icon */}
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.2)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
          <path d="M8 15a6 6 0 0 0 6 6" />
          <circle cx="20" cy="21" r="1" />
          <path d="M20 16v4" />
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
      <div className="mx-auto grid min-h-[calc(100vh-60px-32px)] max-w-[1200px] grid-cols-1 items-center gap-0 px-6 lg:grid-cols-[1fr_1.15fr] lg:px-10">

        {/* ════════════ LEFT COLUMN — Content ════════════ */}
        <div className="flex flex-col gap-8 py-16 lg:py-0">

          {/* H1 */}
          <h1 className="text-[2.5rem] font-bold leading-[1.08] tracking-tight lg:text-[3.1rem]">
            <span className="text-indigo-600">Cuidado Pediátrico</span>
            <br />
            <span className="text-slate-900">Integral y Excelencia</span>
            <br />
            <span className="text-slate-900">Médica</span>
            <br />
            <span className="text-slate-900">Comienzan Aquí</span>
          </h1>

          {/* Stat + description */}
          <div className="flex items-start gap-6">
            {/* Divider line */}
            <div className="mt-1 w-px self-stretch bg-teal-300" aria-hidden="true" />

            {/* 98% stat block */}
            <div className="flex-shrink-0">
              <p className="text-[3rem] font-bold leading-none text-indigo-900">98%</p>
              <p className="mt-1 text-[12px] font-semibold uppercase tracking-widest text-teal-600">
                Padres<br />Satisfechos
              </p>
            </div>

            {/* Description */}
            <p className="mt-2 max-w-[210px] text-[13px] leading-relaxed text-slate-500">
              Ofreciendo atención pediátrica integral con médicos especializados,
              tecnología de vanguardia y un compromiso absoluto con el bienestar de su hijo.
            </p>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="#agendar"
              id="hero-cta-reserve"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-9 py-3.5 text-[14px] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-300/50 hover:shadow-xl active:scale-[0.97]"
            >
              Reservar Cita
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators row */}
          <div className="flex items-center gap-5">
            <div className="flex -space-x-2">
              {['#a5b4fc', '#6ee7b7', '#fcd34d', '#f9a8d4'].map((color, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white"
                  style={{ background: color }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-[12px] text-slate-500">
              <span className="font-semibold text-slate-700">+2,400</span> familias nos eligieron
            </p>
          </div>
        </div>

        {/* ════════════ RIGHT COLUMN — Image & Layered Graphics ════════════ */}
        <div className="relative flex min-h-[580px] items-end justify-center lg:min-h-[calc(100vh-60px)]">

          {/* ── LAYER 1: Large organic cyan blob (base backdrop) ── */}
          <div
            aria-hidden="true"
            className="absolute right-[-6%] top-[3%] h-[91%] w-[87%]"
            style={{
              background: 'linear-gradient(145deg, #ccfbf1 0%, #b2f5ea 45%, #a5f3fc 100%)',
              borderRadius: '62% 38% 45% 55% / 48% 42% 58% 52%',
              opacity: 0.92,
            }}
          />

          {/* ── LAYER 1b: Secondary smaller blob (depth accent) ── */}
          <div
            aria-hidden="true"
            className="absolute left-[12%] top-[6%] h-[72px] w-[72px]"
            style={{
              background: '#a5f3fc',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
              opacity: 0.75,
            }}
          />

          {/* ── LAYER 1c: Tiny accent circle top-right ── */}
          <div
            aria-hidden="true"
            className="absolute right-[6%] top-[10%] h-[36px] w-[36px] rounded-full opacity-55"
            style={{ background: '#67e8f9' }}
          />

          {/* ── LAYER 2a: SVG — Topographic wavy lines (left peek) ── */}
          <SvgTopographicLines />

          {/* ── LAYER 2b: SVG — Dot matrix (right side) ── */}
          <SvgDotMatrix />

          {/* ── LAYER 2c: SVG — Molecular nodes (top) ── */}
          

          {/* ── LAYER 2d: SVG — Molecular nodes (bottom) ── */}
          <SvgMolecularNodesBottom />

          {/* ── LAYER 2e: Fine diagonal grid lines (subtle tech texture) ── */}
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="absolute left-[18%] top-[35%] h-[30%] w-auto opacity-15"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 28}
                x2="200"
                y2={i * 28}
                stroke="#6366f1"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 28}
                y1="0"
                x2={i * 28}
                y2="200"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
            ))}
          </svg>

          {/* ── LAYER 3: Doctor image (hero, centered on blob) ── */}
          <div className="relative z-10 h-full w-full max-w-[640px]">
            <Image
              src="/doctora_landing.PNG"
              alt="Dra. Martins — Pediatra especialista"
              width={640}
              height={860}
              className="h-full w-full object-contain object-bottom"
              style={{
                maskImage: 'linear-gradient(to bottom, black 93%, transparent 99%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 93%, transparent 99%)',
              }}
              priority
            />
          </div>

          {/* ── LAYER 4a: Badge "Atención al Niño" — upper right floating ── */}
          <div
            className="absolute right-[-2%] top-[22%] z-20 animate-float-badge"
            aria-hidden="true"
          >
            <BadgeChildCare />
          </div>

          {/* ── LAYER 4b: Badge "Atención Médica Integral" — lower floating ── */}
          <div
            className="absolute bottom-[20%] left-[4%] z-20 animate-float-badge-delay"
            aria-hidden="true"
          >
            <BadgeMedicalCare />
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
