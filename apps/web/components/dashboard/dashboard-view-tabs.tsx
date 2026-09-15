import { Activity, CheckCircle2, Inbox, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export type DashboardView = 'resumen' | 'solicitudes' | 'en-curso' | 'atendidos';

type DashboardViewTabsProps = {
  activeView: DashboardView;
  /** Cantidad de solicitudes del portal pendientes (badge). */
  pendingRequests: number;
};

const VIEWS: readonly {
  id: DashboardView;
  label: string;
  href: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: 'resumen', label: 'Resumen', href: '/dashboard', icon: LayoutGrid },
  { id: 'solicitudes', label: 'Solicitudes', href: '/dashboard?view=solicitudes', icon: Inbox },
  { id: 'en-curso', label: 'En curso', href: '/dashboard?view=en-curso', icon: Activity },
  {
    id: 'atendidos',
    label: 'Atendidos hoy',
    href: '/dashboard?view=atendidos',
    icon: CheckCircle2,
  },
];

/**
 * DashboardViewTabs — Server Component.
 *
 * Cambia la VISTA de la operación del día (no navega secciones — eso es el
 * sidebar). URL-driven: /dashboard?view=solicitudes
 */
export function DashboardViewTabs({
  activeView,
  pendingRequests,
}: DashboardViewTabsProps): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-0 overflow-x-auto no-scrollbar"
      role="tablist"
      aria-label="Vistas del día"
    >
      {VIEWS.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.id;

        return (
          <Link
            key={view.id}
            href={view.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 -mb-px shrink-0',
              isActive
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200',
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-slate-400')} />
            {view.label}
            {view.id === 'solicitudes' && pendingRequests > 0 && (
              <span
                className={cn(
                  'ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  isActive ? 'bg-brand text-white' : 'bg-violet-100 text-violet-700',
                )}
              >
                {pendingRequests}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
