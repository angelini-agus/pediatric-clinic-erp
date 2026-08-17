import { ArrowRight } from 'lucide-react';

const APP_BASE_URL = 'http://localhost:3000';

// ── Floating Cards ─────────────────────────────────────────────────────────────

function CardEspecialistas(): React.JSX.Element {
  return (
    <div
      className="hidden lg:flex absolute top-[28%] -left-8 lg:-left-56 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl shadow-blue-900/5 items-center gap-3 z-20 animate-float"
      style={{ minWidth: '155px' }}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-white">
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop"
          alt="Especialista"
          width={40}
          height={40}
          loading="lazy"
          className="object-cover"
        />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-bold text-slate-900">200+</p>
        <p className="text-[10px] text-gray-500 font-medium">Mejores Especialistas</p>
      </div>
    </div>
  );
}

function CardDoctora(): React.JSX.Element {
  return (
    <div className="hidden lg:flex absolute bottom-24 right-0 lg:-right-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl shadow-blue-900/5 items-center gap-4 z-20 min-w-[280px] animate-float-delayed">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1F6BFF] text-white flex items-center justify-center font-bold text-sm shrink-0">
          DM
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold text-slate-900">Dra. Martinangelio</p>
          <p className="text-[10px] text-gray-500">Pediatra Jefe</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 ml-auto">
        <span className="text-[9px] font-semibold text-green-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 block" />
          Turnos libres hoy
        </span>
        <a
          href={`${APP_BASE_URL}/register`}
          className="text-[10px] font-medium border border-gray-200 hover:bg-gray-50 text-slate-900 px-3 py-1 rounded-full transition"
        >
          Sacar turno
        </a>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

/**
 * HeroSection — the split-layout hero of the landing page.
 *
 * Mobile: 100dvh no-scroll, left column (50%) / right column (50%) layout.
 * Desktop: 12-column CSS grid with the doctor image spanning 2 rows (right half).
 */
export function HeroSection(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="font-sans flex-1 flex flex-col lg:overflow-hidden w-full max-w-[1400px] mx-auto px-6 gap-4 relative z-10 lg:grid lg:grid-cols-12 lg:grid-rows-[1fr_1fr] lg:gap-x-4 lg:gap-y-0"
    >
      {/* ── Headline + description (full width on mobile, top-left cell on desktop) ── */}
      <div className="w-full lg:col-span-6 lg:row-start-1 lg:flex lg:flex-col lg:justify-center lg:pl-10 lg:relative lg:z-20">
        <h1 className="font-display text-[clamp(2.7rem,5.1vw,4.6rem)] leading-[0.98] tracking-[-0.02em] font-bold text-[#0F1C36] mb-4 lg:mb-8">
          Cuidando la Salud,<br />
          <span className="bg-[linear-gradient(100deg,#2E8FCE_0%,#16A87E_48%,#ED7F3C_90%)] bg-clip-text text-transparent">
            Inspirando
          </span>{' '}
          Vidas
        </h1>
        <p className="text-gray-500 text-base mb-6 max-w-[540px] leading-relaxed lg:text-xl lg:mb-12">
          Empoderando el bienestar de tus hijos a través de atención pediátrica integral.
          Accedé al portal para sacar turnos, ver la historia clínica y gestionar su salud.
        </p>
      </div>

      {/* ── Bottom row (mobile: 50/50 flex; desktop: lg:contents for grid cells) ── */}
      <div className="flex-1 flex flex-row w-full relative min-h-0 lg:contents">

        {/* Left column — CTAs + stats */}
        <div className="w-[42%] relative z-20 flex flex-col justify-start pt-2 lg:col-span-6 lg:row-start-2 lg:pt-0 lg:justify-center lg:pl-10 lg:z-20">
          {/* CTA buttons */}
          <div className="flex flex-col gap-3 mb-6 lg:flex-row lg:gap-5 lg:mb-12">
            <a
              href={`${APP_BASE_URL}/register`}
              id="hero-cta-turno"
              className="w-fit flex flex-row items-center justify-center gap-2 px-10 py-5 rounded-full whitespace-nowrap font-semibold text-xl transition-all bg-slate-900 text-white hover:bg-slate-800"
            >
              Sacar Turno
            </a>
            <a
              href={`${APP_BASE_URL}/login`}
              id="hero-cta-erp"
              className="w-fit flex flex-row items-center justify-center gap-2 px-10 py-5 rounded-full whitespace-nowrap font-semibold text-xl transition-all bg-white text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-50"
            >
              Ingresar al ERP
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats — 150k+ (círculos + número), 15+, 20+ */}
          <div className="flex flex-row items-center gap-6 lg:gap-10 flex-nowrap">
            {/* 150k+ — círculos superpuestos + número */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-400 z-10" aria-hidden="true" />
                <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-orange-300 -ml-4 z-20" aria-hidden="true" />
                <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-teal-300 to-cyan-300 -ml-4 z-30" aria-hidden="true" />
              </div>
              <div className="leading-tight">
                <p className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">150k+</p>
                <p className="text-base text-slate-500 font-medium">Familias Atendidas</p>
              </div>
            </div>
            {/* 15+ */}
            <div>
              <h3 className="font-display text-4xl font-extrabold text-slate-900 leading-none">15+</h3>
              <p className="text-base text-slate-500 font-medium mt-1">Años de Experiencia</p>
            </div>
            {/* 20+ */}
            <div>
              <h3 className="font-display text-4xl font-extrabold text-slate-900 leading-none">20+</h3>
              <p className="text-base text-slate-500 font-medium mt-1">Pediatras Especialistas</p>
            </div>
          </div>
        </div>

        {/* Right column — Doctor image + floating badges */}
        <div className="w-[58%] relative h-full lg:justify-self-end lg:col-span-6 lg:row-start-1 lg:row-span-2 lg:flex lg:items-end lg:justify-end">
          {/* Background ellipse (CSS-only, no filter blur DOM node) */}
          <div
            className="absolute top-[8%] right-[5%] lg:right-0 w-[68%] h-[76%] rounded-[50%] opacity-60 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse at 55% 45%, #c7dff7 0%, #dbeeff 55%, transparent 80%)',
            }}
          />

          {/* Doctor image */}
          <div
            className="
              absolute bottom-0 -right-[65%] w-[240%] h-full z-10
              lg:absolute lg:inset-y-0 lg:right-0 lg:w-[160.3%]
            "
          >
            <img
              src="/doctora_landing.PNG"
              alt="Dra. Martinangelio — Pediatra Jefe"
              width={900}
              height={1100}
              {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
              className="object-contain object-bottom drop-shadow-xl lg:object-cover lg:object-bottom"
            />
          </div>

          {/* Floating badges */}
          <CardEspecialistas />
          <CardDoctora />
        </div>
      </div>
    </main>
  );
}