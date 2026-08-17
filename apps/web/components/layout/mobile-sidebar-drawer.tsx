'use client';

import { Activity, X } from 'lucide-react';
import { useEffect } from 'react';


import { SidebarNav } from './sidebar-nav';
import { UserDropdownMenu } from './user-dropdown-menu';

import type { AuthUser } from '@pediatric-erp/schemas';

type MobileSidebarDrawerProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly user: AuthUser | null;
}

/**
 * MobileSidebarDrawer — Drawer lateral controlado por estado del padre.
 *
 * Implementado en Tailwind puro (sin Radix Dialog) para evitar agregar
 * dependencias. Características:
 *  - Bloquea el scroll del body cuando está abierto.
 *  - Cierra con la tecla Escape y al hacer click en el backdrop.
 *  - Restaura `overflow` del body en unmount/close (defensa contra fugas).
 *  - Renderiza la MISMA `SidebarNav` que el sidebar de escritorio,
 *    garantizando paridad visual y de comportamiento.
 */
export function MobileSidebarDrawer({ open, onClose, user }: MobileSidebarDrawerProps): React.JSX.Element {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return (): void => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}
    >
      {/* Backdrop */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar menú"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-slate-200 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <Activity className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="font-bold text-slate-900 text-base leading-none tracking-tight">
              i<span className="text-brand">PediERP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-colors shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer nav (misma SidebarNav del desktop) */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
          <SidebarNav />
        </div>

        {/* Drawer footer (user dropdown) */}
        <div className="px-4 pt-3 pb-5 border-t border-slate-100/80">
          <UserDropdownMenu variant="sidebar" user={user} />
        </div>
      </aside>
    </div>
  );
}
