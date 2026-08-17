import type { ReactNode } from 'react';

import { DashboardShell } from '@/components/layout/dashboard-shell';
import { decodeAuthPayload } from '@/lib/jwt';

/**
 * DashboardLayout — Server Component.
 *
 * Decodifica el JWT de la cookie httpOnly una sola vez por request y
 * propaga la identidad del usuario (`AuthUser | null`) al shell cliente.
 * Si el token es inválido o está ausente, `user` es `null` y la UI muestra
 * un fallback genérico ("Profesional", iniciales "??").
 *
 * El shell (`DashboardShell`) es Client Component solo para coordinar el
 * estado del Drawer móvil; este layout sigue siendo RSC puro para permitir
 * `cookies()` server-side.
 */
export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const user = decodeAuthPayload();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
