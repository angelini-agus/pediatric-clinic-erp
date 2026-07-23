import { SidebarNav } from './sidebar-nav';
import { Activity } from 'lucide-react';

export function Sidebar() {
  return (
    // Sin border-r, sin bg-white — integrado visualmente con el fondo radial
    <aside className="w-64 fixed top-0 left-0 bottom-0 z-30 flex flex-col px-3 py-5">
      {/* Logo — sin border-b */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm shrink-0">
          <Activity className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-base leading-none">PediERP</div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">Clínica Pediátrica</div>
        </div>
      </div>

      {/* Nav — centrado verticalmente con flex-1 + justify-center */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-4 mb-3">
          Menú Principal
        </div>
        <SidebarNav />
      </div>

      {/* Footer Profile — sin border-t */}
      <div className="px-1 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/50 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand font-bold text-xs flex items-center justify-center shrink-0">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-800 truncate">Dr. Ricardo Silva</div>
            <div className="text-[10px] text-slate-500 truncate">Pediatra · Mat. 48102</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
