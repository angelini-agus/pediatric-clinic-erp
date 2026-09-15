import Link from 'next/link';

import { cn } from '@/lib/utils';

type ConsultationsTabsProps = {
  activeTab: 'hoy' | 'historial';
  /** El historial clínico global es DOCTOR/ADMIN/SUPER_ADMIN only. */
  showHistory: boolean;
};

/**
 * ConsultationsTabs — Server Component. URL-driven tabs (no client state).
 */
export function ConsultationsTabs({
  activeTab,
  showHistory,
}: ConsultationsTabsProps): React.JSX.Element {
  const tabs = [
    { key: 'hoy' as const, label: 'Hoy', href: '/consultations' },
    ...(showHistory
      ? [
          {
            key: 'historial' as const,
            label: 'Historial clínico',
            href: '/consultations?tab=historial',
          },
        ]
      : []),
  ];

  return (
    <nav
      className="inline-flex gap-1 rounded-2xl bg-white/60 p-1 shadow-sm backdrop-blur-xl"
      aria-label="Secciones de consultas"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={activeTab === tab.key ? 'page' : undefined}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            activeTab === tab.key
              ? 'bg-white text-brand shadow-sm'
              : 'text-slate-500 hover:text-slate-800',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
