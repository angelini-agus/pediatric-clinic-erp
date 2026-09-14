'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { errorClass, labelClass, triggerClass } from './form-styles';

type TimeSlot = { value: string; label: string };

type DateTimePickerProps = {
  dateId: string;
  timeId: string;
  dateValue: Date | undefined;
  timeValue: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  dateError?: string | undefined;
  timeError?: string | undefined;
  /**
   * Disables both pickers until patient + doctor are selected. The
   * pickers show a friendly "elegí paciente y médico primero" hint.
   */
  isDateTimeEnabled: boolean;
  /** True while `useSlotAvailability` is fetching booked slots. */
  isCheckingAvailability: boolean;
  /** HH:MM slots occupied by non-CANCELED appointments. */
  bookedTimes: Set<string>;
};

/**
 * Generates 30-minute slots between 08:00 and 20:00 (es-AR locale).
 * Memoized at module scope so the array isn't recomputed each render.
 */
const TIME_SLOTS: TimeSlot[] = ((): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let h = 8; h < 20; h += 1) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const value = `${hh}:${mm}`;
      const label = new Date(2000, 0, 1, h, m).toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      slots.push({ value, label });
    }
  }
  return slots;
})();

/**
 * Computes the calendar's default visible month: if fewer than 7 days
 * remain in the current month, jump to next month so the user sees
 * mostly selectable dates instead of a grayed-out grid.
 */
export function getCalendarDefaultMonth(): Date {
  const today = new Date();
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInCurrentMonth - today.getDate();
  return daysRemaining < 7 ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : today;
}

/**
 * DateTimePicker — two-column date + time selector.
 *
 * Both pickers remain disabled until `isDateTimeEnabled` flips true (the
 * parent form gates this on patient + doctor selection). The time picker
 * additionally reflects booked slots from `useSlotAvailability`,
 * rendering them disabled with an "Ocupado" suffix.
 */
export function DateTimePicker({
  dateId,
  timeId,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  isDateTimeEnabled,
  isCheckingAvailability,
  bookedTimes,
}: DateTimePickerProps): React.JSX.Element {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const calendarDefaultMonth = useMemo(getCalendarDefaultMonth, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* ── Date ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <span className={labelClass}>
          Fecha <span className="text-rose-500">*</span>
        </span>
        <Popover
          open={isDateTimeEnabled ? isDateOpen : false}
          onOpenChange={(v) => {
            if (isDateTimeEnabled) setIsDateOpen(v);
          }}
        >
          <PopoverTrigger asChild>
            <button
              id={dateId}
              type="button"
              data-testid="appointment-date"
              disabled={!isDateTimeEnabled}
              className={`${triggerClass(Boolean(dateError))} flex items-center justify-between gap-2 text-left ${
                !dateValue ? 'text-slate-400' : ''
              } ${!isDateTimeEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <span className="truncate">
                {dateValue
                  ? format(dateValue, "dd 'de' MMMM", { locale: es })
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
              selected={dateValue}
              defaultMonth={calendarDefaultMonth}
              onSelect={(day) => {
                onDateChange(day);
                setIsDateOpen(false);
              }}
              disabled={(date) => date < today}
            />
          </PopoverContent>
        </Popover>
        {dateError && <p className={errorClass}>{dateError}</p>}
      </div>

      {/* ── Time ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <span className={labelClass}>
          Hora <span className="text-rose-500">*</span>
        </span>
        <Select value={timeValue} onValueChange={onTimeChange}>
          <SelectTrigger
            id={timeId}
            data-testid="appointment-time"
            hasError={Boolean(timeError)}
            className={!timeValue ? '[&>span]:text-slate-400' : ''}
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
                  data-testid={`appointment-time-option-${value}`}
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
        {timeError && <p className={errorClass}>{timeError}</p>}
      </div>
    </div>
  );
}
