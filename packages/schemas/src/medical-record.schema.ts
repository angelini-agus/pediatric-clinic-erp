import { z } from 'zod';

/**
 * Zod Schemas for MedicalRecord model.
 *
 * Law 26.529 Compliance:
 * - Medical records are append-only.
 * - Diagnosis and notes cannot be empty strings.
 */

// ── Create ───────────────────────────────────────────────────
export const medicalRecordCreateSchema = z.object({
  diagnosis: z
    .string()
    .trim()
    .min(1, { message: 'Diagnosis cannot be empty' })
    .max(500, { message: 'Diagnosis cannot exceed 500 characters' }),
  notes: z
    .string()
    .trim()
    .min(1, { message: 'Clinical notes cannot be empty' }),
  treatment: z.string().trim().nullish(),
  prescription: z.string().trim().nullish(),
  doctorId: z
    .string()
    .trim()
    .min(1, { message: 'Doctor ID is required' })
    .optional(),
});

export type MedicalRecordCreate = z.infer<typeof medicalRecordCreateSchema>;
