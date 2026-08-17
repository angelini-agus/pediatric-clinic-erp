'use client';

import { errorClass, labelClass, triggerClass } from './form-styles';

import type { DoctorOption } from '@/lib/api';


type DoctorSelectProps = {
  id: string;
  /** Stable selector for E2E tests (anti-fragile UI automation). */
  testId: string;
  value: string;
  onChange: (value: string) => void;
  doctors: DoctorOption[];
  isLoading: boolean;
  errorMessage?: string | undefined;
};

/**
 * DoctorSelect — native `<select>` for active doctors.
 *
 * Renders `fullName — specialty` when the specialty is set, otherwise
 * just `fullName`. Disabled while the dropdown options are loading.
 */
export function DoctorSelect({
  id,
  testId,
  value,
  onChange,
  doctors,
  isLoading,
  errorMessage,
}: DoctorSelectProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={labelClass}>
        Médico <span className="text-rose-500">*</span>
      </label>
      <select
        id={id}
        data-testid={testId}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        disabled={isLoading}
        className={`${triggerClass(Boolean(errorMessage))} disabled:opacity-50 disabled:cursor-wait`}
      >
        <option value="">
          {isLoading ? 'Cargando médicos...' : 'Seleccioná un médico'}
        </option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.fullName}
            {d.specialty ? ` — ${d.specialty}` : ''}
          </option>
        ))}
      </select>
      {errorMessage && <p className={errorClass}>{errorMessage}</p>}
    </div>
  );
}
