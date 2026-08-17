'use client';

import {
  LayoutGrid,
  Calendar,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type Tab = {
  id: string;
  label: string;
  icon: typeof LayoutGrid;
  enabled: boolean;
};

const tabs: readonly Tab[] = [
  { id: 'general', label: 'General', icon: LayoutGrid, enabled: true },
  { id: 'appointments', label: 'Turnos', icon: Calendar, enabled: true },
  // Tabs sin funcionalidad — se renderizan deshabilitados visualmente
  // (opacity-50 + cursor-not-allowed) para evitar clicks que no hacen nada
  // y dejar claro que están pendientes de implementar.
  { id: 'revenue', label: 'Ingresos', icon: DollarSign, enabled: false },
  { id: 'inventory', label: 'Inventario', icon: Package, enabled: false },
  { id: 'patients', label: 'Pacientes', icon: Users, enabled: true },
];

/**
 * DashboardTabsClient — Client Component for tab navigation.
 * Isolated here so the parent page.tsx can remain a Server Component
 * and compose async Server Components like TodaysBookingCard.
 */
export function DashboardTabsClient(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isDisabled = !tab.enabled;
        return (
          <button
            key={tab.id}
            type="button"
            disabled={isDisabled}
            aria-disabled={isDisabled}
            onClick={() => {
              if (isDisabled) return;
              setActiveTab(tab.id);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 -mb-px shrink-0',
              isDisabled &&
                'opacity-50 cursor-not-allowed hover:border-transparent hover:text-slate-400',
              !isDisabled && isActive && 'border-brand text-brand font-semibold',
              !isDisabled &&
                !isActive &&
                'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200',
            )}
          >
            <Icon className={cn('h-4 w-4', isActive && !isDisabled ? 'text-brand' : 'text-slate-400')} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
