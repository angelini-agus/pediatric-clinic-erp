'use client';

import { useState } from 'react';
import {
  LayoutGrid,
  Calendar,
  DollarSign,
  Package,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'general', label: 'General', icon: LayoutGrid },
  { id: 'appointments', label: 'Turnos', icon: Calendar },
  { id: 'revenue', label: 'Ingresos', icon: DollarSign },
  { id: 'inventory', label: 'Inventario', icon: Package },
  { id: 'patients', label: 'Pacientes', icon: Users },
];

/**
 * DashboardTabsClient — Client Component for tab navigation.
 * Isolated here so the parent page.tsx can remain a Server Component
 * and compose async Server Components like TodaysBookingCard.
 */
export function DashboardTabsClient() {
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="flex items-center gap-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 -mb-px',
              isActive
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-slate-400')} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
