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
    <header className="h-20 flex items-center justify-between px-6 bg-transparent">
      {/* LEFT: Avatar + greeting + date */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ring-2 ring-white">
          RS
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            Hola, Dr. Ricardo Silva
          </h1>
          <p className="text-sm text-slate-400 leading-tight mt-0.5 font-medium">
            {dateDisplay}
          </p>
        </div>
      </div>

      {/* RIGHT: Search + action buttons */}
      <div className="flex items-center gap-2.5">
        {/* Pill search */}
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 w-52 shadow-sm">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* New appointment button */}
        <button
          type="button"
          aria-label="Nuevo turno"
          className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm hover:bg-brand-600 transition-colors duration-150 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Notifications button */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0 relative shadow-sm"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
        </button>

        {/* Settings button */}
        <button
          type="button"
          aria-label="Configuración"
          className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0 shadow-sm"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User profile button */}
        <button
          type="button"
          aria-label="Perfil"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0"
        >
          RS
        </button>
      </div>
    </header>
  );
}
