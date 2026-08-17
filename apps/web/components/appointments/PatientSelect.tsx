'use client';

import { errorClass, labelClass, triggerClass } from './form-styles';

import type { PatientResponse } from '@/lib/api';


type PatientSelectProps = {
  id: string;
  /** Stable selector for E2E tests (anti-fragile UI automation). */
  testId: string;
  value: string;
  onChange: (value: string) => void;
  patients: PatientResponse[];
  isLoading: boolean;
  errorMessage?: string | undefined;
};

/**
 * PatientSelect — native `<select>` bound to react-hook-form.
 *
 * Kept as a presentational component so the parent form stays focused on
 * orchestration (schema, submit, toast) — this component only renders UI
 * and forwards the change upward.
 */
export function PatientSelect({
  id,
  testId,
  value,
  onChange,
  patients,
  isLoading,
  errorMessage,
}: PatientSelectProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={labelClass}>
        Paciente <span className="text-rose-500">*</span>
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
          {isLoading ? 'Cargando pacientes...' : 'Seleccioná un paciente'}
        </option>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.firstName} {p.lastName}
          </option>
        ))}
      </select>
      {errorMessage && <p className={errorClass}>{errorMessage}</p>}
    </div>
  );
}
