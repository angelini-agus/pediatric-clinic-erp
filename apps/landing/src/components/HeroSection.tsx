import { ArrowRight } from 'lucide-react';

const APP_BASE_URL = 'http://localhost:3000';

function CardDoctora(): React.JSX.Element {
  return (
    <div className="hidden lg:flex absolute bottom-24 right-0 lg:-right-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-xl shadow-blue-900/5 items-center gap-4 z-40 min-w-[280px] load-float-delayed">
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
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 block ping-dot" />
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

/**
 * HeroSection — layout flex simple: columna izquierda (texto) + columna derecha (foto).
 * Sin grid de 12 columnas. El bloque de texto está centrado verticalmente
 * dentro de su mitad, y el contenido interno tiene un max-width para no
 * estirarse demasiado.
 * La foto (z-30) desborda overflow:visible hacia la sección oscura inferior.
 */
export function HeroSection(): React.JSX.Element {
  return (
    <main
      id="main-content"
      className="flex-1 flex flex-row w-full max-w-[1400px] mx-auto relative z-10"
      style={{ overflow: 'visible' }}
    >
      {/* ── Blobs de luz ambiental ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute" style={{ right: '-5%', bottom: '10%', width: '55%', height: '70%', borderRadius: '50%', background: '#BEE3F8', opacity: 0.18, filter: 'blur(90px)' }} />
        <div className="absolute" style={{ left: '-8%', top: '5%', width: '38%', height: '45%', borderRadius: '50%', background: '#BEE3F8', opacity: 0.15, filter: 'blur(80px)' }} />
        <div className="absolute" style={{ right: '20%', top: '30%', width: '32%', height: '40%', borderRadius: '50%', background: '#D9D3F0', opacity: 0.20, filter: 'blur(100px)' }} />
      </div>

      {/* ── Columna izquierda — texto centrado ── */}
      <div className="relative z-20 w-[42%] lg:w-1/2 flex items-center">
        {/* px-6 coincide exactamente con el px-6 de la navbar → h1 arranca bajo el logo */}
        <div className="w-full px-6 lg:pl-6 lg:pr-4 flex flex-col">

          <h1
            className="font-display text-[clamp(2rem,5.1vw,4.6rem)] leading-[0.98] tracking-[-0.02em] font-bold text-[#0F1C36] load-rise"
            style={{ animationDelay: '50ms' }}
          >
            La misma pediatra,<br />
            en cada etapa de tu hijo
          </h1>

          <p
            className="text-gray-500 text-sm mt-4 max-w-[440px] leading-relaxed lg:text-xl lg:mt-6 load-rise"
            style={{ animationDelay: '160ms' }}
          >
            Seguimiento pediátrico continuo desde la etapa de preconcepción hasta la
            adolescencia, siempre con la Dra. Martinangelio. Sacá turno o ingresá al
            portal para ver la historia clínica de tu hijo.
          </p>

          <div className="mt-6 h-px w-12 bg-[#BEE3F8] lg:mt-8 load-rise" style={{ animationDelay: '260ms' }} aria-hidden="true" />

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:gap-4 lg:mt-6 load-rise" style={{ animationDelay: '340ms' }}>
            <a
              href={`${APP_BASE_URL}/register`}
              id="hero-cta-turno"
              className="w-fit flex items-center justify-center gap-2 px-6 py-3 lg:px-10 lg:py-5 rounded-xl whitespace-nowrap font-semibold text-base lg:text-xl transition-all bg-slate-900 text-white hover:bg-slate-800 btn-shine"
            >
              Sacar turno
            </a>
            <a
              href="#doctora"
              id="hero-cta-doctora"
              className="w-fit flex items-center justify-center gap-2 px-6 py-3 lg:px-10 lg:py-5 rounded-xl whitespace-nowrap font-semibold text-base lg:text-xl transition-all bg-white text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-50 group"
            >
              Conocer a la Dra.
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="mt-6 flex flex-row gap-6 lg:gap-10 lg:mt-8 load-rise" style={{ animationDelay: '430ms' }}>
            <div>
              <h3 className="font-display text-2xl lg:text-4xl font-extrabold text-slate-900 leading-none">[X]+</h3>
              <p className="text-xs lg:text-base text-slate-500 font-medium mt-1">Años de Ejercicio Profesional</p>
            </div>
            <div>
              <h3 className="font-display text-xl lg:text-3xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">Jefa de Servicio</h3>
              <p className="text-xs lg:text-base text-slate-500 font-medium mt-1">Hospital Eva Perón</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Columna derecha — foto ── */}
      <div
        className="relative w-[58%] lg:w-1/2 h-full"
        style={{ overflow: 'visible' }}
      >
        <div
          className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center pointer-events-none load-fade"
          style={{ zIndex: 30, overflow: 'visible', animationDelay: '220ms' }}
        >
          <img
            src="/doctora_landing.PNG"
            alt="Dra. Martinangelio — Pediatra Jefe"
            width={900}
            height={1100}
            {...({ fetchpriority: 'high' } as React.ImgHTMLAttributes<HTMLImageElement>)}
            className="w-full h-full object-contain object-bottom drop-shadow-xl"
            style={{ overflow: 'visible' }}
          />
        </div>
        <CardDoctora />
      </div>
    </main>
  );
}