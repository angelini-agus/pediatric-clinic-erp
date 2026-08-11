import Link from 'next/link';

/**
 * Landing Mission Section — dark bottom section.
 *
 * Dark navy/indigo-950 background (derived from the ERP's brand palette),
 * replacing the teal from the reference. Exact Spanish copy from image_14.
 */
export function MissionSection(): React.JSX.Element {
  return (
    <section
      id="nosotros"
      className="relative overflow-hidden bg-[#0f0e2b] py-24 px-5 lg:px-10"
      aria-label="Nuestra misión"
    >
      {/* ── Subtle glowing blobs (brand purple, very dark) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-800/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-800/15 blur-3xl" />
      </div>

      {/* ── Decorative diamond ── */}
      <div aria-hidden="true" className="absolute bottom-8 right-8 h-2 w-2 rotate-45 bg-brand-400/30" />
      <div aria-hidden="true" className="absolute top-10 right-20 h-1.5 w-1.5 rotate-45 bg-indigo-400/20" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* ── "Nuestra Misión" pill badge ── */}
        <div className="mb-10 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" aria-hidden="true" />
            Nuestra Misión
          </span>
        </div>

        {/* ── Mission statement — exact copy from reference ── */}
        <p className="mb-12 text-3xl font-medium leading-[1.4] tracking-tight text-white sm:text-4xl lg:text-5xl">
          Creemos que la salud de sus hijos debe ser{' '}
          <span className="text-brand-300">prioritaria, accesible</span> y compasiva.
          Nuestro enfoque integral garantiza un crecimiento saludable,
          porque su bienestar y su confianza son lo más importante.
        </p>

        {/* ── "Sobre Nosotros" CTA button ── */}
        <Link
          href="#nosotros"
          id="mission-about-us-cta"
          className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/15 hover:shadow-lg active:scale-[0.97]"
        >
          Sobre Nosotros
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
