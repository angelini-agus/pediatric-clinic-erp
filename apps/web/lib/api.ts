import { z } from 'zod';
import {
  appointmentStatusSchema,
  medicalRecordCreateSchema,
  prescriptionCreateSchema,
  clinicSettingsResponseSchema,
  type ClinicSettingsResponse,
} from '@pediatric-erp/schemas';

// ── Response shape schemas ────────────────────────────────────────────────────
// DRY: built with Zod, no manual interfaces.

export const patientResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  biologicalSex: z.string(),
  documentType: z.string(),
  documentNumber: z.string(),
  bloodGroup: z.string().nullish(),
  healthInsurance: z.string().nullish(),
  healthInsurancePlan: z.string().nullish(),
  healthInsuranceNumber: z.string().nullish(),
  guardianFullName: z.string(),
  guardianPhone: z.string(),
  guardianEmail: z.string().nullish(),
  guardianRelationship: z.string(),
  birthWeightGrams: z.number().nullish(),
  gestationalWeeks: z.number().nullish(),
  apgarScore: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type PatientResponse = z.infer<typeof patientResponseSchema>;

export const doctorOptionSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string().nullish(),
  medicalLicense: z.string().nullish(),
});
export type DoctorOption = z.infer<typeof doctorOptionSchema>;

const doctorResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  specialty: z.string().nullish(),
  medicalLicense: z.string().nullish(),
});

export const appointmentResponseSchema = z.object({
  id: z.string(),
  dateTime: z.coerce.date(),
  type: z.string(),
  notes: z.string().nullish(),
  status: appointmentStatusSchema,
  patientId: z.string(),
  doctorId: z.string(),
  patient: patientResponseSchema,
  doctor: doctorResponseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;

// Medical Record response includes doctor details
export const medicalRecordResponseSchema = z.object({
  id: z.string(),
  diagnosis: z.string(),
  notes: z.string(),
  treatment: z.string().nullish(),
  prescription: z.string().nullish(),
  patientId: z.string(),
  doctorId: z.string(),
  doctor: doctorResponseSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

export type MedicalRecordResponse = z.infer<typeof medicalRecordResponseSchema>;

// Analytics response schemas
export const nextAppointmentPatientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  age: z.string(),
});

export const nextAppointmentSchema = z
  .object({
    id: z.string(),
    dateTime: z.coerce.date(),
    time: z.string(),
    type: z.string(),
    patient: nextAppointmentPatientSchema,
  })
  .nullable();

export const appointmentFunnelSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  waiting: z.number().int().nonnegative(),
});

export const dashboardAnalyticsSchema = z.object({
  nextAppointment: nextAppointmentSchema,
  appointmentFunnel: appointmentFunnelSchema,
  unsignedRecords: z.number().int().nonnegative(),
  canceledToday: z.number().int().nonnegative(),
});

export type DashboardAnalytics = z.infer<typeof dashboardAnalyticsSchema>;

// Re-export Zod schema for use in form validation (client components)
export { medicalRecordCreateSchema, prescriptionCreateSchema };

// ── Data Fetching ─────────────────────────────────────────────────────────────

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

/**
 * Fetches dashboard operational analytics metrics from NestJS API.
 * Server-side safe (cache: 'no-store').
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics | null> {
  try {
    const res = await fetch(`${API_URL}/analytics/dashboard`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /analytics/dashboard failed: ${res.status}`);
      return null;
    }

    const json: unknown = await res.json();
    const parsed = dashboardAnalyticsSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] Analytics response validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching analytics:', error);
    return null;
  }
}

/**
 * Fetches today's active appointments from the NestJS API.
 * Server-side only (App Router).
 */
export async function getTodaysAppointments(): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/today`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /appointments/today failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(appointmentResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Response validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching appointments:', error);
    return [];
  }
}

/**
 * Fetches a single patient by ID.
 * Returns null if not found or on network error.
 */
export async function getPatient(id: string): Promise<PatientResponse | null> {
  try {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /patients/${id} failed: ${res.status}`);
      return null;
    }

    const json: unknown = await res.json();
    const parsed = patientResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] Patient validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching patient:', error);
    return null;
  }
}

/**
 * Fetches all active patients from the NestJS API.
 * Server-side only (App Router).
 */
export async function getPatients(): Promise<PatientResponse[]> {
  try {
    const res = await fetch(`${API_URL}/patients`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /patients failed: ${res.status}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(patientResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Patients list validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching patients:', error);
    return [];
  }
}

/**
 * Fetches the full clinical history for a patient.
 * Returns empty array on error.
 */
export async function getMedicalRecords(
  patientId: string,
): Promise<MedicalRecordResponse[]> {
  try {
    const res = await fetch(
      `${API_URL}/patients/${patientId}/medical-records`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      console.error(`[api] GET /patients/${patientId}/medical-records failed: ${res.status}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(medicalRecordResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Medical records validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching medical records:', error);
    return [];
  }
}

/**
 * Fetches all upcoming appointments (dateTime >= now) from the NestJS API.
 * Server-side only (App Router).
 */
export async function getUpcomingAppointments(): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/upcoming`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`[api] GET /appointments/upcoming failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(appointmentResponseSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Upcoming appointments validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching upcoming appointments:', error);
    return [];
  }
}

/**
 * Fetches all active doctors from the NestJS API.
 * Used by NewAppointmentForm to populate the doctor select.
 * Client-side safe (called from useEffect).
 */
export async function getDoctors(): Promise<DoctorOption[]> {
  try {
    const res = await fetch(`${API_URL}/doctors`, { cache: 'no-store' });

    if (!res.ok) {
      console.error(`[api] GET /doctors failed: ${res.status}`);
      return [];
    }

    const json: unknown = await res.json();
    const parsed = z.array(doctorOptionSchema).safeParse(json);

    if (!parsed.success) {
      console.error('[api] Doctors validation failed:', parsed.error.flatten());
      return [];
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching doctors:', error);
    return [];
  }
}

// Re-export for use in client components
export { clinicSettingsResponseSchema };
export type { ClinicSettingsResponse };

/**
 * Fetches the current clinic settings singleton from the NestJS API.
 * Returns null if not yet configured or on error.
 * Server-side safe (cache: 'no-store').
 */
export async function getClinicSettings(): Promise<ClinicSettingsResponse | null> {
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });

    if (!res.ok) {
      return null;
    }

    const json: unknown = await res.json();
    if (json === null) return null;

    const parsed = clinicSettingsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.error('[api] ClinicSettings validation failed:', parsed.error.flatten());
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('[api] Network error fetching clinic settings:', error);
    return null;
  }
}

/**
 * Patches (upserts) clinic settings. Called from Client Component via browser fetch.
 * Returns the updated settings or throws on error.
 */
export async function updateClinicSettings(
  data: Partial<{
    fullName: string;
    licenseNumber: string;
    specialty: string;
    clinicName: string;
  }>,
): Promise<ClinicSettingsResponse> {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update settings: ${res.status} ${errorText}`);
  }

  const json: unknown = await res.json();
  const parsed = clinicSettingsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid response from settings API');
  }

  return parsed.data;
}
