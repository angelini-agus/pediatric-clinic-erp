import { Bell, Plus, Settings } from 'lucide-react';
import Link from 'next/link';

import { DateDisplay } from './date-display';
import { HeaderSearch } from './header-search';
import { UserDropdownMenu } from './user-dropdown-menu';
import { getUserInitials } from '@/lib/utils';

import type { AuthUser } from '@pediatric-erp/schemas';

type HeaderProps = {
  readonly onMenuClick?: () => void;
  readonly user: AuthUser | null;
};

/**
 * Header — Server Component.
 *
 * Datos del usuario (`name`, `email`, `role`, initials) se decodifican del
 * JWT en el Server Component padre (`(dashboard)/layout.tsx`) y se inyectan
 * como props. Si la decodificación falla (token inválido o faltante) se
 * pasa `user = null` y la UI muestra un fallback seguro (sin iniciales,
 * sin nombre).
 */
export function Header({ onMenuClick, user }: HeaderProps): React.JSX.Element {
  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-6 bg-transparent gap-3">
      {/* LEFT: Mobile menu button + avatar + greeting + date */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Mobile hamburger — abre el Drawer con la navegación */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          className="md:hidden w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-colors shadow-sm shrink-0"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Avatar with user initials */}
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 ring-2 ring-white">
          {user?.fullName ? getUserInitials(user.fullName) : '??'}
        </div>
        <div className="min-w-0">
          <h1 className="text-base md:text-xl font-bold text-slate-800 leading-tight truncate">
            Hola, {user?.fullName ?? 'Profesional'}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 leading-tight mt-0.5 font-medium truncate">
            <DateDisplay />
          </p>
        </div>
      </div>

      {/* RIGHT: Search + action buttons */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        {/* Global search (debounced, redirige a /patients?q=…) */}
        <HeaderSearch />

        {/* New appointment button */}
        <button
          type="button"
          aria-label="Nuevo turno"
          className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm hover:bg-brand-600 transition-colors duration-150 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Notifications button */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="hidden sm:flex w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0 relative shadow-sm"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
        </button>

        {/* Settings button */}
        <Link
          href="/settings"
          aria-label="Configuración"
          className="hidden md:flex w-9 h-9 rounded-xl bg-white/70 backdrop-blur-sm items-center justify-center text-slate-500 hover:bg-white hover:text-slate-700 transition-all duration-150 shrink-0 shadow-sm"
        >
          <Settings className="h-4 w-4" />
        </Link>

        {/* User profile dropdown */}
        <UserDropdownMenu variant="header" user={user} />
      </div>
    </header>
  );
}

