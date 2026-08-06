'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClinicSettingsResponse } from '@/lib/api';
import { updateClinicSettings } from '@/lib/api';

interface SettingsFormProps {
  defaultValues: ClinicSettingsResponse | null;
}

export function SettingsForm({ defaultValues }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [values, setValues] = useState({
    fullName: defaultValues?.fullName ?? '',
    licenseNumber: defaultValues?.licenseNumber ?? '',
    specialty: defaultValues?.specialty ?? '',
    clinicName: defaultValues?.clinicName ?? '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateClinicSettings(values);
      showToast('¡Configuración guardada exitosamente!', 'success');
      router.refresh();
    } catch {
      showToast('Error al guardar la configuración. Intente nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg text-sm font-medium transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
              : 'bg-red-500/90 text-white backdrop-blur-sm'
          }`}
        >
          {toast.type === 'success' ? (
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Glassmorphism card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border-none shadow-sm p-8">
        <form onSubmit={handleSubmit} id="settings-form" className="space-y-6">
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
                name="fullName"
                type="text"
                value={values.fullName}
                onChange={handleChange}
                placeholder="Dr. Juan Pérez"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
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
                name="licenseNumber"
                type="text"
                value={values.licenseNumber}
                onChange={handleChange}
                placeholder="Mat. 48102"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
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
                name="specialty"
                type="text"
                value={values.specialty}
                onChange={handleChange}
                placeholder="Pediatría"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
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
                name="clinicName"
                type="text"
                value={values.clinicName}
                onChange={handleChange}
                placeholder="Clínica Pediátrica San Martín"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              id="save-settings-btn"
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
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
