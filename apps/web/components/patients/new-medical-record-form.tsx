'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Loader2, Stethoscope, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createMedicalRecord } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Validation schema (client-side form only) ─────────────────────────────────
const formSchema = z.object({
  diagnosis: z
    .string()
    .trim()
    .min(1, 'El diagnóstico es obligatorio')
    .max(500, 'El diagnóstico no puede superar los 500 caracteres'),
  notes: z
    .string()
    .trim()
    .min(1, 'Las notas clínicas son obligatorias'),
  treatment: z.string().trim().optional(),
  prescription: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────
type NewMedicalRecordFormProps = {
  patientId: string;
  doctorId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function NewMedicalRecordForm({
  patientId,
  doctorId,
}: NewMedicalRecordFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      diagnosis: '',
      notes: '',
      treatment: '',
      prescription: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      await createMedicalRecord(patientId, {
        doctorId,
        diagnosis: data.diagnosis,
        notes: data.notes,
        ...(data.treatment ? { treatment: data.treatment } : {}),
        ...(data.prescription ? { prescription: data.prescription } : {}),
      });

      reset();
      setIsOpen(false);
      showToast('Historia clínica firmada y guardada correctamente', 'success');
      router.refresh();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al guardar la evolución médica.';
      setApiError(errorMsg);
      showToast('Error al firmar la historia clínica', 'error');
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
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
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Card container */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header — toggleable button */}
        <button
          type="button"
          onClick={() => { setIsOpen((prev) => !prev); }}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Stethoscope className="h-4 w-4 text-brand" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Nueva Evolución</p>
              <p className="text-xs text-slate-400">Registrar consulta médica</p>
            </div>
          </div>
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-200',
              isOpen ? 'bg-slate-400 rotate-45' : 'bg-brand',
            )}
          >
            <PlusCircle className="h-4 w-4" />
          </div>
        </button>

        {/* Form — expanded state */}
        {isOpen && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-5 pb-5 pt-1 border-t border-slate-100 flex flex-col gap-4"
            noValidate
          >
            {/* Diagnosis */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="diagnosis"
                className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Diagnóstico <span className="text-rose-500">*</span>
              </label>
              <input
                id="diagnosis"
                type="text"
                placeholder="Ej: Bronquiolitis aguda leve"
                {...register('diagnosis')}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
                  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
                  errors.diagnosis ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
                )}
              />
              {errors.diagnosis && (
                <p className="text-xs text-rose-500">{errors.diagnosis.message}</p>
              )}
            </div>

            {/* Clinical notes */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="notes"
                className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Notas Clínicas <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Descripción detallada del cuadro clínico, síntomas, examen físico..."
                {...register('notes')}
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
                  errors.notes ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
                )}
              />
              {errors.notes && (
                <p className="text-xs text-rose-500">{errors.notes.message}</p>
              )}
            </div>

            {/* Treatment (optional) */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="treatment"
                className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Tratamiento <span className="text-slate-300 font-normal normal-case">(opcional)</span>
              </label>
              <textarea
                id="treatment"
                rows={2}
                placeholder="Indicaciones de tratamiento..."
                {...register('treatment')}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
            </div>

            {/* Prescription (optional) */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="prescription"
                className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
              >
                Prescripción <span className="text-slate-300 font-normal normal-case">(opcional)</span>
              </label>
              <textarea
                id="prescription"
                rows={2}
                placeholder="Medicamentos, dosis, posología..."
                {...register('prescription')}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
              />
            </div>

            {/* API error */}
            {apiError && (
              <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                {apiError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => { reset(); setIsOpen(false); setApiError(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Evolución'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
