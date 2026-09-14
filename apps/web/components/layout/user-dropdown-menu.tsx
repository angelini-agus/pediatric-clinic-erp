'use client';

import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserInitials } from '@/lib/utils';

import type { AuthUser } from '@pediatric-erp/schemas';

type UserDropdownMenuProps = {
  variant?: 'sidebar' | 'header';
  user: AuthUser | null;
};

/**
 * Returns the role label in Spanish for display.
 */
function formatRole(role: AuthUser['role'] | undefined): string {
  if (!role) return '';
  return role
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export function UserDropdownMenu({
  variant = 'sidebar',
  user,
}: UserDropdownMenuProps): React.JSX.Element {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fullName = user?.fullName ?? 'Profesional';
  const email = user?.email ?? '';
  const roleLabel = formatRole(user?.role);
  const initials = getUserInitials(fullName);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      // El servidor borra la cookie httpOnly (JS del cliente no puede tocarla).
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Aun si falla la red, el middleware redirigirá a /login si la
      // cookie sigue presente; el UX sigue siendo seguro.
    } finally {
      router.push('/login');
      router.refresh();
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'sidebar' ? (
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm hover:bg-white hover:shadow-md transition-all duration-150 text-left outline-none cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">{fullName}</div>
              {roleLabel && <div className="text-[10px] text-slate-500 truncate">{roleLabel}</div>}
            </div>
          </button>
        ) : (
          <button
            type="button"
            aria-label="Perfil de usuario"
            data-testid="header-user-menu"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0 hover:scale-105 transition-transform outline-none cursor-pointer"
          >
            {initials}
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={variant === 'sidebar' ? 'start' : 'end'}
        side={variant === 'sidebar' ? 'top' : 'bottom'}
        sideOffset={8}
        className="w-56 bg-white/80 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl p-1.5"
      >
        <DropdownMenuLabel className="px-3 py-2">
          <div className="font-semibold text-xs text-slate-900">{fullName}</div>
          {email && (
            <div className="text-[10px] font-normal text-slate-500 lowercase truncate">{email}</div>
          )}
          {roleLabel && (
            <div className="text-[10px] font-normal text-slate-400 mt-0.5">{roleLabel}</div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-slate-100/80 cursor-pointer"
          >
            <Settings className="h-4 w-4 text-slate-500 shrink-0" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            void handleLogout();
          }}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 focus:text-red-700 focus:bg-red-50/80 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <LogOut className="h-4 w-4 text-red-500 shrink-0" />
          <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
