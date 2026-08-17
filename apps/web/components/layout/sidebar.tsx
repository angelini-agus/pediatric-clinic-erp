import { Activity } from 'lucide-react';


import { SidebarNav } from './sidebar-nav';
import { UserDropdownMenu } from './user-dropdown-menu';

import type { AuthUser } from '@pediatric-erp/schemas';

type SidebarProps = {
  readonly user: AuthUser | null;
};

export function Sidebar({ user }: SidebarProps): React.JSX.Element {
  return (
    // Oculto en móvil: el Drawer (MobileSidebarDrawer) muestra la misma nav.
    // `hidden md:flex` evita el overflow horizontal en pantallas chicas.
    <aside className="hidden md:flex w-60 shrink-0 flex-col px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-sm shrink-0">
          <Activity className="h-4 w-4 stroke-[2.5]" />
        </div>
        <div className="font-bold text-slate-900 text-base leading-none tracking-tight">
          i<span className="text-brand">PediERP</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <SidebarNav />
      </div>

      <div className="px-2 pt-6">
        <UserDropdownMenu variant="sidebar" user={user} />
      </div>
    </aside>
  );
}

