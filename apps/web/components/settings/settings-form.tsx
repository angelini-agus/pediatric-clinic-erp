'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { clinicSettingsUpdateSchema, type ClinicSettingsUpdate } from '@pediatric-erp/schemas';

import type { ClinicSettingsResponse } from '@/lib/api';

import { updateClinicSettings } from '@/lib/api';

type SettingsFormValues = ClinicSettingsUpdate;

type SettingsFormProps = {
  defaultValues: ClinicSettingsResponse | null;
};

type ToastState = {
  message: string;
  type: 'success' | 'error';
} | null;

/**
 * SettingsForm — formulario de configuración de la clínica.
 *
 * Refactorizado de useState manual a `react-hook-form` + Zod:
 *   - Validación declarativa (single source of truth: el schema).
 *   - Menos re-renders: solo el field que cambia se actualiza.
 *   - Tipos derivados automáticamente del schema (`SettingsFormValues`).
 *   - Estados de submit manejados por RHF (`isSubmitting`).
 */
export function SettingsForm({ defaultValues }: SettingsFormProps): React.JSX.Element {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(clinicSettingsUpdateSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      licenseNumber: defaultValues?.licenseNumber ?? '',
      specialty: defaultValues?.specialty ?? '',
      clinicName: defaultValues?.clinicName ?? '',
    },
  });

  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => { setToast(null); }, 3500);
  };

  const onValid = async (values: SettingsFormValues): Promise<void> => {
    try {
      await updateClinicSettings(values);
      showToast('¡Configuración guardada exitosamente!', 'success');
      router.refresh();
    } catch {
      showToast('Error al guardar la configuración. Intente nuevamente.', 'error');
    }
  };

  return (
    <div className="relative">
      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Glassmorphism card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-8">
        <form
          id="settings-form"
          onSubmit={(e) => void handleSubmit(onValid)(e)}
          className="space-y-6"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre Completo */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-slate-700"
              >
                Nombre Completo del Médico
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Dr. Juan Pérez"
                {...register('fullName')}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                  errors.fullName
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-brand'
                }`}
              />
              {errors.fullName?.message && (
                <p className="text-xs text-rose-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Matrícula */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="licenseNumber"
                className="text-sm font-semibold text-slate-700"
              >
                Matrícula Profesional
              </label>
              <input
                id="licenseNumber"
                type="text"
                placeholder="Mat. 48102"
                {...register('licenseNumber')}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                  errors.licenseNumber
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-brand'
                }`}
              />
              {errors.licenseNumber?.message && (
                <p className="text-xs text-rose-500">{errors.licenseNumber.message}</p>
              )}
            </div>

            {/* Especialidad */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="specialty"
                className="text-sm font-semibold text-slate-700"
              >
                Especialidad
              </label>
              <input
                id="specialty"
                type="text"
                placeholder="Pediatría"
                {...register('specialty')}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                  errors.specialty
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-brand'
                }`}
              />
              {errors.specialty?.message && (
                <p className="text-xs text-rose-500">{errors.specialty.message}</p>
              )}
            </div>

            {/* Nombre de la Clínica */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="clinicName"
                className="text-sm font-semibold text-slate-700"
              >
                Nombre de la Clínica
              </label>
              <input
                id="clinicName"
                type="text"
                placeholder="Clínica Pediátrica San Martín"
                {...register('clinicName')}
                className={`w-full rounded-xl border bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand/30 ${
                  errors.clinicName
                    ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-brand'
                }`}
              />
              {errors.clinicName?.message && (
                <p className="text-xs text-rose-500">{errors.clinicName.message}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              id="save-settings-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
