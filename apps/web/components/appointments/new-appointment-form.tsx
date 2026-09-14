'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAppointmentFormData } from '@/hooks/useAppointmentFormData';
import { useSlotAvailability } from '@/hooks/useSlotAvailability';
import { CLIENT_API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

import { DateTimePicker } from './date-time-picker';
import { DoctorSelect } from './doctor-select';
import { errorClass, labelClass, triggerClass } from './form-styles';
import { PatientSelect } from './patient-select';

// ── Schema ────────────────────────────────────────────────────────────────────

const newAppointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Seleccioná un paciente'),
  doctorId: z.string().min(1, 'Seleccioná un médico'),
  date: z
    .date({ required_error: 'Seleccioná una fecha' })
    .refine((d) => d >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'La fecha debe ser hoy o posterior',
    }),
  time: z.string().min(1, 'Seleccioná un horario'),
  type: z
    .string()
    .trim()
    .min(1, 'El motivo del turno es obligatorio')
    .max(100, 'El motivo no puede superar 100 caracteres'),
  notes: z.string().trim().max(1000).optional(),
});

type NewAppointmentFormValues = z.infer<typeof newAppointmentFormSchema>;

// ── Props ─────────────────────────────────────────────────────────────────────

type NewAppointmentFormProps = {
  onSuccess: () => void;
};

type ToastState = { type: 'success' | 'error'; message: string } | null;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * NewAppointmentForm — orquestador puro.
 *
 * Responsabilidades limitadas a:
 *   1. Configurar `useForm` con Zod (validación declarativa).
 *   2. Consumir los custom hooks `useAppointmentFormData` y
 *      `useSlotAvailability` para cargar pacientes, médicos y slots.
 *   3. Componer los sub-componentes presentacionales (`PatientSelect`,
 *      `DoctorSelect`, `DateTimePicker`).
 *   4. Manejar el submit (POST al proxy) y el toast de feedback.
 *
 * Toda la lógica de fetching vive en hooks; toda la UI vive en
 * sub-componentes. El orquestador no conoce detalles de slots, calendario
 * ni formato de slots — solo conecta los cables.
 */
export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps): React.JSX.Element {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);

  const { patients, doctors, isLoading: isLoadingOptions } = useAppointmentFormData();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(newAppointmentFormSchema),
    defaultValues: {
      patientId: '',
      doctorId: '',
      date: undefined as unknown as Date,
      time: '',
      type: '',
      notes: '',
    },
  });

  const watchedDoctorId = watch('doctorId');
  const watchedPatientId = watch('patientId');
  const watchedDate = watch('date');

  // Both patient AND doctor must be selected before date/time are accessible.
  const isDateTimeEnabled = Boolean(watchedPatientId) && Boolean(watchedDoctorId);

  const { bookedTimes, isChecking: isCheckingAvailability } = useSlotAvailability(
    watchedDoctorId,
    watchedDate,
  );

  const onSubmit = async (data: NewAppointmentFormValues): Promise<void> => {
    setToast(null);

    // Combine date + time into a single ISO DateTime string.
    const parts = data.time.split(':');
    const hours = Number.parseInt(parts[0] ?? '0', 10);
    const minutes = Number.parseInt(parts[1] ?? '0', 10);
    const dateTime = new Date(data.date);
    dateTime.setHours(hours, minutes, 0, 0);

    if (dateTime <= new Date()) {
      setToast({
        type: 'error',
        message: 'La fecha y hora deben ser futuras.',
      });
      return;
    }

    try {
      const res = await fetch(`${CLIENT_API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: data.patientId,
          doctorId: data.doctorId,
          dateTime: dateTime.toISOString(),
          type: data.type,
          notes: data.notes ?? undefined,
          status: 'SCHEDULED',
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { message?: string };
        setToast({
          type: 'error',
          message: err.message ?? 'Error al agendar el turno.',
        });
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
      setToast({
        type: 'error',
        message: 'Error de conexión con el servidor.',
      });
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      data-testid="appointment-form"
      className="flex flex-col gap-4"
      noValidate
    >
      {/* ── Paciente ──────────────────────────────────────────────── */}
      <Controller
        control={control}
        name="patientId"
        render={({ field }) => (
          <PatientSelect
            id="na-patientId"
            testId="appointment-patient-select"
            value={field.value}
            onChange={field.onChange}
            patients={patients}
            isLoading={isLoadingOptions}
            errorMessage={errors.patientId?.message}
          />
        )}
      />

      {/* ── Médico ────────────────────────────────────────────────── */}
      <Controller
        control={control}
        name="doctorId"
        render={({ field }) => (
          <DoctorSelect
            id="na-doctorId"
            testId="appointment-doctor-select"
            value={field.value}
            onChange={field.onChange}
            doctors={doctors}
            isLoading={isLoadingOptions}
            errorMessage={errors.doctorId?.message}
          />
        )}
      />

      {/* ── Fecha & Hora ──────────────────────────────────────────── */}
      <Controller
        control={control}
        name="date"
        render={({ field: dateField }) => (
          <Controller
            control={control}
            name="time"
            render={({ field: timeField }) => (
              <DateTimePicker
                dateId="na-date"
                timeId="na-time"
                dateValue={dateField.value}
                timeValue={timeField.value}
                onDateChange={dateField.onChange}
                onTimeChange={timeField.onChange}
                dateError={errors.date?.message}
                timeError={errors.time?.message}
                isDateTimeEnabled={isDateTimeEnabled}
                isCheckingAvailability={isCheckingAvailability}
                bookedTimes={bookedTimes}
              />
            )}
          />
        )}
      />

      {/* ── Motivo del Turno ─────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-type" className={labelClass}>
          Motivo del Turno <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-type"
          type="text"
          data-testid="appointment-type"
          placeholder="Ej: Control de Rutina, Vacunación, Cuadro Febril..."
          {...register('type')}
          className={cn(triggerClass(Boolean(errors.type)), 'placeholder:text-slate-300')}
        />
        {errors.type?.message && <p className={errorClass}>{errors.type.message}</p>}
      </div>

      {/* ── Notas (opcional) ──────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-notes" className={labelClass}>
          Notas <span className="text-slate-300 font-normal normal-case">(opcional)</span>
        </label>
        <textarea
          id="na-notes"
          rows={2}
          data-testid="appointment-notes"
          placeholder="Observaciones adicionales..."
          {...register('notes')}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 bg-white/80 placeholder:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
        />
      </div>

      {/* ── Inline toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          role="alert"
          data-testid="appointment-toast"
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

      {/* ── Actions ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          data-testid="appointment-cancel"
          onClick={() => {
            reset();
            setToast(null);
            onSuccess();
          }}
          className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="na-submit"
          data-testid="appointment-submit"
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
