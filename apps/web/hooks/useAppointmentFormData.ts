'use client';

import { useEffect, useState } from 'react';

import { CLIENT_API_URL } from '@/lib/api';

import type { DoctorOption, PatientResponse } from '@/lib/api';

type UseAppointmentFormDataResult = {
  patients: PatientResponse[];
  doctors: DoctorOption[];
  isLoading: boolean;
};

/**
 * Loads the dropdown options needed by `NewAppointmentForm`:
 *  - patients (active list)
 *  - doctors (active list)
 *
 * Both requests fire in parallel via `Promise.all`. The hook returns the
 * latest results once both settle; the `cancelled` guard prevents a
 * state-update warning if the component unmounts mid-fetch.
 *
 * All requests go through the proxy layer (`CLIENT_API_URL`) so the
 * httpOnly JWT cookie is attached automatically.
 */
export function useAppointmentFormData(): UseAppointmentFormDataResult {
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch(`${CLIENT_API_URL}/patients`, { cache: 'no-store' }),
          fetch(`${CLIENT_API_URL}/doctors`, { cache: 'no-store' }),
        ]);

        const [patientsJson, doctorsJson] = (await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
        ])) as [unknown, unknown];

        if (cancelled) return;

        // GET /patients is paginated server-side and returns `{ data, total }`.
        // Accept BOTH shapes defensively: the legacy plain array (pre-pagination
        // backend) and the current paginated envelope.
        const paginatedPatients =
          typeof patientsJson === 'object' &&
          patientsJson !== null &&
          'data' in patientsJson &&
          Array.isArray(patientsJson.data)
            ? (patientsJson as { data: PatientResponse[] }).data
            : null;

        setPatients(
          paginatedPatients ??
            (Array.isArray(patientsJson) ? (patientsJson as PatientResponse[]) : []),
        );
        setDoctors(Array.isArray(doctorsJson) ? (doctorsJson as DoctorOption[]) : []);
      } catch {
        // Network failure: leave arrays empty; the selects still render.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return (): void => {
      cancelled = true;
    };
  }, []);

  return { patients, doctors, isLoading };
}
