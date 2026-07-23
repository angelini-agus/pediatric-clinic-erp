import { Bell, Search, Settings, Plus } from 'lucide-react';

function getFormattedDate(): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

export function Header() {
  const today = getFormattedDate();
  const dateDisplay = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    // Sin border-b, sin bg-white — transparente, hereda el gradiente del body
    <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* IZQUIERDA: Avatar circular + saludo + fecha */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ring-2 ring-white/80">
          RS
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Hola, Dr. Ricardo Silva
          </h1>
          <p className="text-sm text-slate-500 leading-tight mt-0.5">
            {dateDisplay}
          </p>
        </div>
      </div>

      {/* DERECHA: Buscador pill + botones de acción circulares */}
      <div className="flex items-center gap-3">
        {/* Buscador pill — fondo traslúcido */}
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/60 w-56">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Botón: Nuevo turno */}
        <button
          type="button"
          aria-label="Nuevo turno"
          className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white shadow-sm hover:bg-brand-700 transition-colors duration-150 shrink-0"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Botón: Notificaciones con badge */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-500 shadow-sm border border-white/60 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0 relative"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Botón: Configuración */}
        <button
          type="button"
          aria-label="Configuración"
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-500 shadow-sm border border-white/60 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
}
