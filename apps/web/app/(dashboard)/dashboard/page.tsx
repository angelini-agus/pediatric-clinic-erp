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
    blobA: 'bg-blue-400/25',
    blobB: 'bg-indigo-300/20',
    icon: DollarSign,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'appointments',
    label: 'Turnos Hoy',
    value: '12',
    change: '3 en espera',
    trending: 'neutral' as const,
    sub: 'Próximo: 10:00 AM',
    blobA: 'bg-purple-400/25',
    blobB: 'bg-pink-300/20',
    icon: Calendar,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: 'patients',
    label: 'Pacientes Activos',
    value: '1.340',
    change: '+8 esta semana',
    trending: 'up' as const,
    sub: 'Nuevos este mes: 24',
    blobA: 'bg-emerald-400/25',
    blobB: 'bg-teal-300/20',
    icon: Users,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'inventory',
    label: 'Stock Crítico',
    value: '3',
    change: '-2 reponer',
    trending: 'down' as const,
    sub: 'Items bajo mínimo',
    blobA: 'bg-amber-400/25',
    blobB: 'bg-orange-300/20',
    icon: Package,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('turnos');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tabs de navegaci\u00f3n interna \u2014 iconos + texto */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/80 text-brand font-semibold shadow-sm border border-white/60 backdrop-blur-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-brand' : 'text-slate-400')} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPI Cards \u2014 grid 4 columnas en xl */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/40 p-6"
            >
              {/* Blobs decorativos absolutos con blur masivo */}
              <div className={cn('absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl', card.blobA)} />
              <div className={cn('absolute -bottom-8 -left-4 w-24 h-24 rounded-full blur-3xl', card.blobB)} />

              {/* Contenido \u2014 z-10 sobre los blobs */}
              <div className="relative z-10">
                <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center mb-4', card.iconBg)}>
                  <Icon className={cn('h-5 w-5', card.iconColor)} />
                </div>

                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {card.label}
                </div>

                <div className="text-3xl font-bold text-slate-800 leading-none mb-2">
                  {card.value}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium flex-wrap">
                  {card.trending === 'up' && <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                  {card.trending === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                  {card.trending === 'neutral' && <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
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

      {/* Tabla de turnos \u2014 glassmorphism */}
      <TodaysBookingCard />
    </div>
  );
}
