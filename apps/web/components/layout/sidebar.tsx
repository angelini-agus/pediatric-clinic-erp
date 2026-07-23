import { SidebarNav } from './sidebar-nav';
import { Activity } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 flex flex-col px-4 py-6 border-r border-slate-100/80">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-sm shrink-0">
          <Activity className="h-4 w-4 stroke-[2.5]" />
        </div>
        <div className="font-bold text-slate-800 text-base leading-none tracking-tight">
          i<span className="text-brand">PediERP</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <SidebarNav />
      </div>

      <div className="px-2 pt-6">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
