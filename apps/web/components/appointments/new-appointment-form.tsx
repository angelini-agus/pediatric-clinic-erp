'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientResponse, DoctorOption } from '@/lib/api';

// ── Form schema ───────────────────────────────────────────────────────────────

const newAppointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Seleccioná un paciente'),
  doctorId: z.string().min(1, 'Seleccioná un médico'),
  dateTime: z
    .string()
    .min(1, 'La fecha y hora son obligatorias')
    .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha y hora inválidas' })
    .refine((v) => new Date(v) > new Date(), {
      message: 'La fecha y hora deben ser futuras',
    }),
  type: z
    .string()
    .trim()
    .min(1, 'El motivo del turno es obligatorio')
    .max(100, 'El motivo no puede superar 100 caracteres'),
  notes: z.string().trim().max(1000).optional(),
});

type NewAppointmentFormValues = z.infer<typeof newAppointmentFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

interface NewAppointmentFormProps {
  onSuccess: () => void;
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

// ── Component ─────────────────────────────────────────────────────────────────

export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      dateTime: '',
      type: '',
      notes: '',
    },
  });

  const API_URL =
    process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  // Load patients and doctors in parallel on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch(`${API_URL}/patients`),
          fetch(`${API_URL}/doctors`),
        ]);
        const [patientsJson, doctorsJson]: [unknown, unknown] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
        ]);
        if (!cancelled) {
          setPatients(Array.isArray(patientsJson) ? (patientsJson as PatientResponse[]) : []);
          setDoctors(Array.isArray(doctorsJson) ? (doctorsJson as DoctorOption[]) : []);
        }
      } catch {
        // Silently fail — empty selects remain usable
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [API_URL]);

  const onSubmit = async (data: NewAppointmentFormValues) => {
    setToast(null);
    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data.patientId,
          doctorId: data.doctorId,
          dateTime: new Date(data.dateTime).toISOString(),
          type: data.type,
          notes: data.notes || undefined,
          status: 'SCHEDULED',
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          (err as { message?: string }).message ?? 'Error al agendar el turno.';
        setToast({ type: 'error', message: msg });
        return;
      }

      reset();
      setToast({ type: 'success', message: 'Turno agendado con éxito.' });
      router.refresh();
      setTimeout(() => {
        setToast(null);
        onSuccess();
      }, 800);
    } catch {
      setToast({ type: 'error', message: 'Error de conexión con el servidor.' });
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
      'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
      hasError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
    );

  const labelClass =
    'text-xs font-semibold text-slate-600 uppercase tracking-wider';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* Paciente */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-patientId" className={labelClass}>
          Paciente <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-patientId"
          {...register('patientId')}
          disabled={isLoadingOptions}
          className={cn(inputClass(!!errors.patientId), 'disabled:opacity-50 disabled:cursor-wait')}
        >
          <option value="">
            {isLoadingOptions ? 'Cargando pacientes...' : 'Seleccioná un paciente'}
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
        {errors.patientId && (
          <p className="text-xs text-rose-500">{errors.patientId.message}</p>
        )}
      </div>

      {/* Médico */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-doctorId" className={labelClass}>
          Médico <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-doctorId"
          {...register('doctorId')}
          disabled={isLoadingOptions}
          className={cn(inputClass(!!errors.doctorId), 'disabled:opacity-50 disabled:cursor-wait')}
        >
          <option value="">
            {isLoadingOptions ? 'Cargando médicos...' : 'Seleccioná un médico'}
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.fullName}{d.specialty ? ` — ${d.specialty}` : ''}
            </option>
          ))}
        </select>
        {errors.doctorId && (
          <p className="text-xs text-rose-500">{errors.doctorId.message}</p>
        )}
      </div>

      {/* Fecha y Hora */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-dateTime" className={labelClass}>
          Fecha y Hora <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-dateTime"
          type="datetime-local"
          {...register('dateTime')}
          className={inputClass(!!errors.dateTime)}
        />
        {errors.dateTime && (
          <p className="text-xs text-rose-500">{errors.dateTime.message}</p>
        )}
      </div>

      {/* Motivo del Turno */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-type" className={labelClass}>
          Motivo del Turno <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-type"
          type="text"
          placeholder="Ej: Control de Rutina, Vacunación, Cuadro Febril..."
          {...register('type')}
          className={cn(inputClass(!!errors.type), 'placeholder:text-slate-300')}
        />
        {errors.type && (
          <p className="text-xs text-rose-500">{errors.type.message}</p>
        )}
      </div>

      {/* Notas (opcional) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-notes" className={labelClass}>
          Notas{' '}
          <span className="text-slate-300 font-normal normal-case">(opcional)</span>
        </label>
        <textarea
          id="na-notes"
          rows={2}
          placeholder="Observaciones adicionales..."
          {...register('notes')}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
        />
      </div>

      {/* Inline toast */}
      {toast && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium border',
            toast.type === 'success'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-rose-600 bg-rose-50 border-rose-200',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          )}
          {toast.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => { reset(); setToast(null); onSuccess(); }}
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="na-submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-600 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Agendar Turno'
          )}
        </button>
      </div>
    </form>
  );
}
