/* ─── Icon helpers ──────────────────────────────────────────────────────── */

function HandWaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" /><path d="M10 10.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6a6 6 0 0 0 12 0v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 1 1 7.5 6.566z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

/**
 * Landing Hero — Split layout.
 *
 * Aesthetic matches the ERP dashboard:
 * - Clean white/slate-50 background
 * - Soft indigo/violet blurred blobs for depth
 * - Glassmorphism badges over the doctor image
 * - Violet vibrant CTA button
 */
export function LandingHero(): React.JSX.Element {
  return (
    <section
      className="relative min-h-[88vh] overflow-hidden bg-slate-50"
      aria-label="Sección principal — Cuidado pediátrico integral"
    >
      {/* ── ERP-style background decorative blobs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right large indigo blob */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-100/70 blur-3xl" />
        {/* Bottom-left violet blob */}
        <div className="absolute -bottom-32 -left-32 h-[440px] w-[440px] rounded-full bg-violet-100/60 blur-3xl" />
        {/* Center-right small accent */}
        <div className="absolute top-1/3 right-1/3 h-[260px] w-[260px] rounded-full bg-brand-100/40 blur-2xl" />
      </div>

      {/* ── Main content grid ── */}
      <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-0 px-5 lg:grid-cols-2 lg:px-10">

        {/* ════════ LEFT — Copy ════════ */}
        <div className="flex flex-col gap-7 py-16 lg:py-0 lg:pr-8">
          {/* H1 — exact copy from reference */}
          <h1 className="text-5xl font-bold leading-[1.12] tracking-tight text-slate-900 lg:text-[3.2rem]">
            <span className="text-brand">Cuidado Pediátrico</span>
            <br />
            <span>Integral y Excelencia</span>
            <br />
            <span>Médica</span>
            <br />
            <span>Comienzan Aquí</span>
          </h1>

          {/* Stat + Description row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
            {/* 98% stat */}
            <div className="flex-shrink-0">
              <p className="text-5xl font-bold leading-none text-slate-900">98%</p>
              <p className="mt-1.5 text-sm font-medium leading-snug text-slate-500">
                Padres<br />Satisfechos
              </p>
            </div>
            {/* Description */}
            <p className="max-w-[26ch] text-sm leading-relaxed text-slate-500 sm:max-w-xs">
              Ofreciendo atención pediátrica integral con médicos especializados,
              tecnología de vanguardia y un compromiso absoluto con el bienestar de su hijo.
            </p>
          </div>

          {/* CTA — Violet brand button */}
          <div>
            <a
              href="#agendar"
              id="hero-cta-reserve"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand/25 active:scale-[0.97]"
            >
              Reservar Cita
            </a>
          </div>
        </div>

        {/* ════════ RIGHT — Doctor image + floating badges ════════ */}
        <div className="relative flex items-end justify-center self-end lg:justify-end">

          {/* ── Glassmorphism badge: "Atención al Niño" (top, right area) ── */}
          <div
            className="absolute right-0 top-[12%] z-20 animate-float-badge lg:right-6 lg:top-[10%]"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/70 px-4 py-2.5 shadow-lg backdrop-blur-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">
                <HandWaveIcon />
              </span>
              <span className="text-sm font-semibold text-slate-700">Atención al Niño</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">
                <UserIcon />
              </span>
            </div>
          </div>

          {/* ── Glassmorphism badge: "Atención Médica Integral" (lower) ── */}
          <div
            className="absolute bottom-[14%] left-[5%] z-20 animate-float-badge-delay lg:bottom-[16%] lg:left-[2%]"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/70 px-4 py-2.5 shadow-lg backdrop-blur-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-brand">
                <UserIcon />
              </span>
              <span className="text-sm font-semibold text-slate-700">Atención Médica Integral</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                <HeartIcon />
              </span>
            </div>
          </div>

          {/* ── Doctor photo with bottom gradient fade ── */}
          <div className="relative w-full max-w-[420px] lg:max-w-[480px]">
            {/* Subtle circular glow behind the photo */}
            <div
              className="absolute inset-x-4 bottom-0 top-[10%] rounded-full bg-indigo-100/80 blur-2xl"
              aria-hidden="true"
            />
            <img
              src="/tia_hero_recortado.png"
              alt="Dra. Martinangelio — Especialista en pediatría"
              width={480}
              height={620}
              loading="lazy"
              className="relative z-10 h-auto w-full object-contain object-bottom"
              style={{
                maskImage: 'linear-gradient(to bottom, black 55%, transparent 97%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 97%)',
              }}
            />
          </div>

          {/* ── Decorative star ── */}
          <span className="absolute bottom-10 right-4 text-brand/30" aria-hidden="true">
            <StarIcon />
          </span>
        </div>
      </div>
    </section>
  );
}