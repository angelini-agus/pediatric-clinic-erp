'use client';

import { LayoutDashboard, Users, Calendar, Stethoscope, Settings, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import type { AuthRole } from '@pediatric-erp/schemas';

type NavItem = {
  readonly name: string;
  readonly href: string;
  readonly icon: typeof LayoutDashboard;
  /** Visible only for ADMIN / SUPER_ADMIN. */
  readonly adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Turnos', href: '/appointments', icon: Calendar },
  { name: 'Consultas', href: '/consultations', icon: Stethoscope },
  { name: 'Profesionales', href: '/staff', icon: UserCog, adminOnly: true },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

type SidebarNavProps = {
  readonly role?: AuthRole | null;
};

export function SidebarNav({ role }: SidebarNavProps): React.JSX.Element {
  const pathname = usePathname();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="space-y-0.5">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (pathname === '/' && item.href === '/dashboard') ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white/90 text-brand font-semibold shadow-sm'
                : 'text-slate-700 hover:bg-white/50 hover:text-slate-950',
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand' : 'text-slate-500')} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
