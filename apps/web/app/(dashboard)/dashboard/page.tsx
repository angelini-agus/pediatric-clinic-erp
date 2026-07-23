'use client';

import { useState } from 'react';
import { TodaysBookingCard } from '@/components/dashboard/todays-booking-card';
import {
  LayoutGrid,
  Calendar,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'general', label: 'General', icon: LayoutGrid },
  { id: 'turnos', label: 'Turnos', icon: Calendar },
  { id: 'ingresos', label: 'Ingresos', icon: DollarSign },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'pacientes', label: 'Pacientes', icon: Users },
];

const kpiCards = [
  {
    id: 'revenue',
    label: 'Ingresos del Mes',
    value: '$248.500',
    change: '+12.5%',
    trending: 'up' as const,
    sub: 'vs. mes anterior',
    blobA: 'bg-violet-400/40',
    blobB: 'bg-pink-400/30',
    icon: DollarSign,
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-100',
  },
  {
    id: 'appointments',
    label: 'Turnos Hoy',
    value: '12',
    change: '3 en espera',
    trending: 'neutral' as const,
    sub: 'Próximo: 10:00 AM',
    blobA: 'bg-indigo-400/35',
    blobB: 'bg-fuchsia-400/30',
    icon: Calendar,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
  },
  {
    id: 'patients',
    label: 'Pacientes Activos',
    value: '1.340',
    change: '+8 esta semana',
    trending: 'up' as const,
    sub: 'Nuevos este mes: 24',
    blobA: 'bg-teal-400/35',
    blobB: 'bg-cyan-400/30',
    icon: Users,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
  },
  {
    id: 'inventory',
    label: 'Stock Crítico',
    value: '3',
    change: '-2 reponer',
    trending: 'down' as const,
    sub: 'Items bajo mínimo',
    blobA: 'bg-rose-400/35',
    blobB: 'bg-orange-400/30',
    icon: Package,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-100',
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('turnos');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Internal navigation tabs with underline style */}
      <div className="flex items-center gap-0 border-b border-slate-300/30">
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

      {/* KPI Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm p-5"
            >
              {/* Decorative blobs — saturated violet/pink visible in corners */}
              <div className={cn('absolute -top-4 -right-4 w-28 h-28 rounded-full blur-2xl', card.blobA)} />
              <div className={cn('absolute -bottom-6 -left-3 w-20 h-20 rounded-full blur-2xl', card.blobB)} />

              {/* Content z-10 */}
              <div className="relative z-10">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', card.iconBg)}>
                  <Icon className={cn('h-[18px] w-[18px]', card.iconColor)} />
                </div>

                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  {card.label}
                </div>

                <div className="text-2xl font-bold text-slate-800 leading-none mb-1.5">
                  {card.value}
                </div>

                <div className="flex items-center gap-1 text-xs font-medium flex-wrap">
                  {card.trending === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />}
                  {card.trending === 'down' && <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />}
                  {card.trending === 'neutral' && <Clock className="h-3 w-3 text-amber-500 shrink-0" />}
                  <span
                    className={cn(
                      card.trending === 'up' && 'text-emerald-600',
                      card.trending === 'down' && 'text-red-500',
                      card.trending === 'neutral' && 'text-amber-600'
                    )}
                  >
                    {card.change}
                  </span>
                  <span className="text-slate-400">{card.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookings table */}
      <TodaysBookingCard />
    </div>
  );
}
