import { z } from 'zod';

/**
 * Zod Schemas for ClinicSettings singleton model.
 * All fields are optional on PATCH (partial update).
 */

// ── Update (PATCH) ────────────────────────────────────────────
export const clinicSettingsUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Full name is required' })
    .max(200, { message: 'Full name cannot exceed 200 characters' })
    .optional(),
  licenseNumber: z
    .string()
    .trim()
    .min(1, { message: 'License number is required' })
    .max(50, { message: 'License number cannot exceed 50 characters' })
    .optional(),
  specialty: z
    .string()
    .trim()
    .min(1, { message: 'Specialty is required' })
    .max(100, { message: 'Specialty cannot exceed 100 characters' })
    .optional(),
  clinicName: z
    .string()
    .trim()
    .min(1, { message: 'Clinic name is required' })
    .max(200, { message: 'Clinic name cannot exceed 200 characters' })
    .optional(),
});

export type ClinicSettingsUpdate = z.infer<typeof clinicSettingsUpdateSchema>;

// ── Response ──────────────────────────────────────────────────
export const clinicSettingsResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  licenseNumber: z.string(),
  specialty: z.string(),
  clinicName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ClinicSettingsResponse = z.infer<typeof clinicSettingsResponseSchema>;
