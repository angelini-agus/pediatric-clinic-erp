import { z } from 'zod';
import { appointmentStatusSchema } from '@pediatric-erp/schemas';

// ── Response shape schemas (matches Prisma AppointmentWithDetails) ──────────
// DRY: Derived from @pediatric-erp/schemas — no duplicate type declarations.

const patientResponseSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  biologicalSex: z.string(),
  guardianFullName: z.string(),
  guardianPhone: z.string(),
  guardianEmail: z.string().nullish(),
  guardianRelationship: z.string(),
  healthInsurance: z.string().nullish(),
  bloodGroup: z.string().nullish(),
  documentType: z.string(),
  documentNumber: z.string(),
  birthWeightGrams: z.number().nullish(),
  gestationalWeeks: z.number().nullish(),
  apgarScore: z.string().nullish(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullish(),
});

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

/** Fully typed appointment row (with patient + doctor) — from Zod, no manual interfaces. */
export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;

// ── Data Fetching ────────────────────────────────────────────────────────────

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1';

/**
 * Fetches today's active appointments from the NestJS API.
 * Runs server-side in Next.js App Router (no 'use client' needed).
 * Validates and parses the response with Zod for full type-safety.
 *
 * @returns Array of today's appointments with patient and doctor details.
 */
export async function getTodaysAppointments(): Promise<AppointmentResponse[]> {
  try {
    const res = await fetch(`${API_URL}/appointments/today`, {
      // No caching — always fetch fresh data for the dashboard
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
