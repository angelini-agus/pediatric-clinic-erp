'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';


import type { PatientResponse, DoctorOption } from '@/lib/api';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getClientAuthHeaders } from '@/lib/api';
import { cn } from '@/lib/utils';

// ── Time slot generator ───────────────────────────────────────────────────────

/**
 * Generates time slots for clinic hours in 30-minute intervals.
 * Range: 08:00 → 20:00.
 */
function generateTimeSlots(): { value: string; label: string }[] {
  const slots: { value: string; label: string }[] = [];
  for (let h = 8; h < 20; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const value = `${hh}:${mm}`;
      // 12h display label — e.g. "08:00 AM", "01:30 PM"
      const date = new Date(2000, 0, 1, h, m);
      const label = date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      slots.push({ value, label });
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

// ── Form schema ───────────────────────────────────────────────────────────────
// Separamos date y time como campos independientes para que cada selector
// tenga su propio estado. Los recombinamos en onSubmit.

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
}

// ── Toast ─────────────────────────────────────────────────────────────────────

type ToastState = { type: 'success' | 'error'; message: string } | null;

// ── Shared style helpers ──────────────────────────────────────────────────────

const triggerClass = (hasError: boolean) =>
  cn(
    'w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white/80',
    'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all',
    hasError ? 'border-rose-300 focus:ring-rose-200' : 'border-slate-200',
  );

const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider';

// ── Component ─────────────────────────────────────────────────────────────────

export function NewAppointmentForm({ onSuccess }: NewAppointmentFormProps) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // If fewer than 7 days remain in the current month, open on next month
  // so the user sees mostly selectable dates instead of a grayed-out grid.
  const today = new Date();
  const daysInCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const daysRemaining = daysInCurrentMonth - today.getDate();
  const calendarDefaultMonth =
    daysRemaining < 7
      ? new Date(today.getFullYear(), today.getMonth() + 1, 1)
      : today;

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

  // Watch doctor + date to check slot availability reactively
  const watchedDoctorId = watch('doctorId');
  const watchedPatientId = watch('patientId');
  const watchedDate = watch('date');

  // Both patient AND doctor must be selected before date/time are accessible.
  const isDateTimeEnabled = !!watchedPatientId && !!watchedDoctorId;

  const API_URL =
    process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

  // ── Doctor availability check ──────────────────────────────────────────────
  // Fetches upcoming appointments and extracts booked HH:MM slots
  // for the selected doctor on the selected date.
  // CANCELED appointments are excluded (they free up the slot).
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    if (!watchedDoctorId || !watchedDate) {
      setBookedTimes(new Set());
      return;
    }

    let cancelled = false;
    const checkAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        const res = await fetch(`${API_URL}/appointments/upcoming`, {
          headers: getClientAuthHeaders(),
        });
        if (!res.ok) return;

        const json: unknown = await res.json();
        if (!Array.isArray(json)) return;

        const selectedDateStr = format(watchedDate, 'yyyy-MM-dd');
        const taken = new Set<string>();

        for (const appt of json as {
          doctorId: string;
          dateTime: string;
          status: string;
        }[]) {
          if (appt.doctorId !== watchedDoctorId) continue;
          if (appt.status === 'CANCELED') continue;

          const apptDate = new Date(appt.dateTime);
          if (format(apptDate, 'yyyy-MM-dd') !== selectedDateStr) continue;

          const hh = String(apptDate.getHours()).padStart(2, '0');
          const mm = String(apptDate.getMinutes()).padStart(2, '0');
          taken.add(`${hh}:${mm}`);
        }

        if (!cancelled) setBookedTimes(taken);
      } catch {
        // Silently fail — all slots remain selectable
      } finally {
        if (!cancelled) setIsCheckingAvailability(false);
      }
    };

    void checkAvailability();
    return () => {
      cancelled = true;
    };
  }, [watchedDoctorId, watchedDate, API_URL]);

  // Load patients and doctors in parallel on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch(`${API_URL}/patients`, { headers: getClientAuthHeaders() }),
          fetch(`${API_URL}/doctors`, { headers: getClientAuthHeaders() }),
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

    // Combine date + time into a single ISO DateTime string
    const parts = data.time.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);
    const dateTime = new Date(data.date);
    dateTime.setHours(hours, minutes, 0, 0);

    // Validate combined dateTime is in the future
    if (dateTime <= new Date()) {
      setToast({ type: 'error', message: 'La fecha y hora deben ser futuras.' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getClientAuthHeaders(),
        },
        body: JSON.stringify({
          patientId: data.patientId,
          doctorId: data.doctorId,
          dateTime: dateTime.toISOString(),
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

  return (
    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="flex flex-col gap-4" noValidate>

      {/* ── Paciente ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-patientId" className={labelClass}>
          Paciente <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-patientId"
          {...register('patientId')}
          disabled={isLoadingOptions}
          className={cn(
            triggerClass(!!errors.patientId),
            'disabled:opacity-50 disabled:cursor-wait',
          )}
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

      {/* ── Médico ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-doctorId" className={labelClass}>
          Médico <span className="text-rose-500">*</span>
        </label>
        <select
          id="na-doctorId"
          {...register('doctorId')}
          disabled={isLoadingOptions}
          className={cn(
            triggerClass(!!errors.doctorId),
            'disabled:opacity-50 disabled:cursor-wait',
          )}
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

      {/* ── Fecha & Hora — grid 2 cols ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Date Picker */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>
            Fecha <span className="text-rose-500">*</span>
          </span>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover
                open={isDateTimeEnabled ? isDateOpen : false}
                onOpenChange={(v) => { if (isDateTimeEnabled) setIsDateOpen(v); }}
              >
                <PopoverTrigger asChild>
                  <button
                    id="na-date"
                    type="button"
                    disabled={!isDateTimeEnabled}
                    className={cn(
                      triggerClass(!!errors.date),
                      'flex items-center justify-between gap-2 text-left',
                      !field.value && 'text-slate-400',
                      !isDateTimeEnabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className="truncate">
                      {field.value
                        ? format(field.value, "dd 'de' MMMM", { locale: es })
                        : isDateTimeEnabled
                          ? 'Seleccioná una fecha'
                          : 'Elegí paciente y médico primero'}
                    </span>
                    <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    defaultMonth={calendarDefaultMonth}
                    onSelect={(day) => {
                      field.onChange(day);
                      setIsDateOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-xs text-rose-500">{errors.date.message}</p>
          )}
        </div>

        {/* Time Select */}
        <div className="flex flex-col gap-1">
          <span className={labelClass}>
            Hora <span className="text-rose-500">*</span>
          </span>
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="na-time"
                  hasError={!!errors.time}
                  className={!field.value ? '[&>span]:text-slate-400' : ''}
                  disabled={!isDateTimeEnabled || isCheckingAvailability}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                    <SelectValue
                      placeholder={
                        !isDateTimeEnabled
                          ? 'Elegí paciente y médico primero'
                          : isCheckingAvailability
                            ? 'Verificando disponibilidad...'
                            : 'Seleccioná'
                      }
                    />
                  </span>
                </SelectTrigger>
                <SelectContent position="popper">
                  {TIME_SLOTS.map(({ value, label }) => {
                    const isBooked = bookedTimes.has(value);
                    return (
                      <SelectItem
                        key={value}
                        value={value}
                        disabled={isBooked}
                        className={isBooked ? 'text-slate-400' : ''}
                        suffix={
                          isBooked ? (
                            <span className="ml-auto shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                              Ocupado
                            </span>
                          ) : undefined
                        }
                      >
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          />
          {errors.time && (
            <p className="text-xs text-rose-500">{errors.time.message}</p>
          )}
        </div>

      </div>

      {/* ── Motivo del Turno ───────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label htmlFor="na-type" className={labelClass}>
          Motivo del Turno <span className="text-rose-500">*</span>
        </label>
        <input
          id="na-type"
          type="text"
          placeholder="Ej: Control de Rutina, Vacunación, Cuadro Febril..."
          {...register('type')}
          className={cn(triggerClass(!!errors.type), 'placeholder:text-slate-300')}
        />
        {errors.type && (
          <p className="text-xs text-rose-500">{errors.type.message}</p>
        )}
      </div>

      {/* ── Notas (opcional) ───────────────────────────────────────── */}
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

      {/* ── Inline toast ───────────────────────────────────────────── */}
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

      {/* ── Actions ────────────────────────────────────────────────── */}
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
