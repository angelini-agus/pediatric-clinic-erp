import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { SettingsForm } from '@/components/settings/settings-form';
import { getClinicSettings } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuración',
  description: 'Configuración del perfil médico y datos de la clínica para la emisión de recetas.',
};

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const settings = await getClinicSettings(getAuthToken());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Configuración</h1>
        <p className="text-sm text-slate-500">
          Administrá los datos del médico y la clínica. Esta información aparecerá en las recetas
          PDF generadas.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 px-5 py-4">
        <svg
          className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-indigo-700">
          Los cambios se reflejarán en las <strong>próximas recetas PDF</strong> emitidas. Las
          recetas ya generadas no se modificarán.
        </p>
      </div>

      {/* Form Card */}
      <SettingsForm defaultValues={settings} />

      {/* Password change */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Seguridad</h2>
        <p className="text-sm text-slate-500">
          Cambiá tu contraseña de acceso al ERP. La sesión actual sigue activa hasta que cierres
          sesión.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
