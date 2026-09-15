import { StaffForm } from '@/components/staff/staff-form';
import { decodeAuthPayload } from '@/lib/jwt';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profesionales',
  description: 'Alta de profesionales del consultorio (médicos, secretarias y administradores).',
};

/**
 * StaffPage — Server Component.
 *
 * Alta de profesionales, exclusiva para ADMIN/SUPER_ADMIN. El chequeo de
 * rol acá es solo UX: la autorización real la enforcea el backend
 * (`POST /api/v1/auth/staff` exige @Roles('ADMIN', 'SUPER_ADMIN')).
 */
export default function StaffPage(): React.JSX.Element {
  const user = decodeAuthPayload();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Profesionales</h1>
        <p className="text-sm text-slate-500">
          Creá cuentas para médicos, secretarias y administradores del consultorio. Cada profesional
          inicia sesión con el email y la contraseña que asignes acá.
        </p>
      </div>

      {isAdmin ? (
        <StaffForm />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm text-amber-800">
          Solo un administrador puede crear profesionales. Si necesitás una cuenta, pedile a un
          administrador que te la cree.
        </div>
      )}
    </div>
  );
}
