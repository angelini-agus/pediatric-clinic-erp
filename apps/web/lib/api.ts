import { z } from 'zod';
import { appointmentStatusSchema, medicalRecordCreateSchema } from '@pediatric-erp/schemas';

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

// Re-export Zod schema for use in form validation (client components)
export { medicalRecordCreateSchema };

// ── Data Fetching ─────────────────────────────────────────────────────────────

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

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
