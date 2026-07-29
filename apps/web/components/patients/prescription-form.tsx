'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Loader2, Pill, Printer, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Validation schema for client-side form ────────────────────────────────────

const formSchema = z.object({
  medication: z
    .string()
    .trim()
    .min(1, 'El nombre del medicamento es obligatorio')
    .max(500, 'El medicamento no puede superar los 500 caracteres'),
  dosage: z
    .string()
    .trim()
    .min(1, 'La dosis y posología son obligatorias')
    .max(200, 'La dosis no puede superar los 200 caracteres'),
  instructions: z
    .string()
    .trim()
    .min(1, 'Las indicaciones son obligatorias'),
});

type FormValues = z.infer<typeof formSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface PrescriptionFormProps {
  patientId: string;
  doctorId: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PrescriptionForm({
  patientId,
  doctorId,
}: PrescriptionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medication: '',
      dosage: '',
      instructions: '',
    },
  });

  const API_URL =
    process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  const onSubmit = async (data: FormValues) => {
    setApiError(null);
    try {
      const response = await fetch(
        `${API_URL}/patients/${patientId}/prescriptions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorId,
            medication: data.medication,
            dosage: data.dosage,
            instructions: data.instructions,
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[prescription] API error response:', errText);
        setApiError('Error al emitir la receta médica en el servidor.');
        return;
      }

      // ── STRICT PDF BLOB HANDLING ──────────────────────────────────────────
      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      // UX: Clear form and close panel after emission
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error('[prescription] Network error generating PDF:', error);
      setApiError('Error de conexión al generar el archivo PDF.');
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header — Collapsible toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
            <Pill className="h-4 w-4 text-violet-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">Emitir Receta Médica</p>
            <p className="text-xs text-slate-400">Generar documento PDF oficial</p>
          </div>
        </div>
        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all duration-200',
            isOpen ? 'bg-slate-400 rotate-45' : 'bg-violet-600',
          )}
        >
          <PlusCircle className="h-4 w-4" />
        </div>
      </button>

      {/* Form — Collapsed / Expanded */}
      {isOpen && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-5 pb-5 pt-1 border-t border-slate-100 flex flex-col gap-4"
          noValidate
        >
          {/* Medication */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="medication"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
            >
              Medicamento <span className="text-rose-500">*</span>
            </label>
            <input
              id="medication"
              type="text"
              placeholder="Ej: Amoxicilina 500mg/5ml Suspensión Oral"
              {...register('medication')}
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all',
                errors.medication ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
              )}
            />
            {errors.medication && (
              <p className="text-xs text-rose-500">{errors.medication.message}</p>
            )}
          </div>

          {/* Dosage */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="dosage"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
            >
              Dosis y Frecuencia <span className="text-rose-500">*</span>
            </label>
            <input
              id="dosage"
              type="text"
              placeholder="Ej: 5 ml cada 8 horas por 7 días"
              {...register('dosage')}
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all',
                errors.dosage ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
              )}
            />
            {errors.dosage && (
              <p className="text-xs text-rose-500">{errors.dosage.message}</p>
            )}
          </div>

          {/* Instructions */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="instructions"
              className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
            >
              Indicaciones de Posología <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="instructions"
              rows={3}
              placeholder="Tomar junto con los alimentos. Completar el tratamiento de 7 días aunque ceda la fiebre..."
              {...register('instructions')}
              className={cn(
                'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all',
                errors.instructions ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
              )}
            />
            {errors.instructions && (
              <p className="text-xs text-rose-500">{errors.instructions.message}</p>
            )}
          </div>

          {/* API Error Message */}
          {apiError && (
            <p className="text-sm text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
              {apiError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                setIsOpen(false);
                setApiError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando documento...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  Emitir Receta PDF
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
