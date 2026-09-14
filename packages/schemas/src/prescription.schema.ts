import { z } from 'zod';

/**
 * Zod Schemas for Prescription model (medical prescription).
 *
 * Compliance:
 * - Medication, dosage, and instructions cannot be empty strings.
 */

// ── Create ───────────────────────────────────────────────────
export const prescriptionCreateSchema = z.object({
  medication: z
    .string()
    .trim()
    .min(1, { message: 'Medication name is required' })
    .max(500, { message: 'Medication name cannot exceed 500 characters' }),
  dosage: z
    .string()
    .trim()
    .min(1, { message: 'Dosage is required' })
    .max(200, { message: 'Dosage cannot exceed 200 characters' }),
  instructions: z.string().trim().min(1, { message: 'Instructions are required' }),
  doctorId: z.string().trim().min(1, { message: 'Doctor ID is required' }),
});

export type PrescriptionCreate = z.infer<typeof prescriptionCreateSchema>;
