/**
 * Zod Schemas for Patient model (pediatric patient).
 *
 * Includes pediatric clinical validations:
 *  - Date of birth cannot be in the future
 *  - Birth weight between 300g and 7000g
 *  - Gestational weeks between 20 and 45
 *
 * RULE: Do not use Prisma enums. Discriminated values
 * are validated as string unions in Zod.
 */
import { z } from 'zod';

// ── Domain Constants ──────────────────────────────────────────
export const BIOLOGICAL_SEXES = ['MALE', 'FEMALE', 'OTHER'] as const;
export const biologicalSexSchema = z.enum(BIOLOGICAL_SEXES);
export type BiologicalSex = z.infer<typeof biologicalSexSchema>;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const bloodGroupSchema = z.enum(BLOOD_GROUPS);
export type BloodGroup = z.infer<typeof bloodGroupSchema>;

export const DOCUMENT_TYPES = ['DNI', 'PASSPORT', 'OTHER'] as const;
export const documentTypeSchema = z.enum(DOCUMENT_TYPES);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const GUARDIAN_RELATIONSHIPS = ['MOTHER', 'FATHER', 'LEGAL_GUARDIAN', 'OTHER'] as const;
export const guardianRelationshipSchema = z.enum(GUARDIAN_RELATIONSHIPS);
export type GuardianRelationship = z.infer<typeof guardianRelationshipSchema>;

// ── Create ───────────────────────────────────────────────────
export const patientCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  documentType: documentTypeSchema.default('DNI'),
  documentNumber: z.string().min(1).max(20),
  dateOfBirth: z.coerce
    .date()
    .refine((date) => date <= new Date(), { message: 'Date of birth cannot be in the future' }),
  biologicalSex: biologicalSexSchema,
  bloodGroup: bloodGroupSchema.nullish(),

  // Health Insurance
  healthInsurance: z.string().max(100).nullish(),
  healthInsurancePlan: z.string().max(50).nullish(),
  healthInsuranceNumber: z.string().max(50).nullish(),

  // Primary guardian
  guardianFullName: z.string().min(1).max(200),
  guardianPhone: z.string().min(1).max(30),
  guardianEmail: z.string().email().nullish(),
  guardianRelationship: guardianRelationshipSchema,

  // Perinatal background
  birthWeightGrams: z.number().int().min(300).max(7000).nullish(),
  gestationalWeeks: z.number().int().min(20).max(45).nullish(),
  apgarScore: z.string().max(10).nullish(),
});
export type PatientCreate = z.infer<typeof patientCreateSchema>;

// ── Update ───────────────────────────────────────────────────
export const patientUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  documentType: documentTypeSchema.optional(),
  documentNumber: z.string().min(1).max(20).optional(),
  dateOfBirth: z.coerce.date().optional(),
  biologicalSex: biologicalSexSchema.optional(),
  bloodGroup: bloodGroupSchema.nullish(),

  healthInsurance: z.string().max(100).nullish(),
  healthInsurancePlan: z.string().max(50).nullish(),
  healthInsuranceNumber: z.string().max(50).nullish(),

  guardianFullName: z.string().min(1).max(200).optional(),
  guardianPhone: z.string().min(1).max(30).optional(),
  guardianEmail: z.string().email().nullish(),
  guardianRelationship: guardianRelationshipSchema.optional(),

  birthWeightGrams: z.number().int().min(300).max(7000).nullish(),
  gestationalWeeks: z.number().int().min(20).max(45).nullish(),
  apgarScore: z.string().max(10).nullish(),
});
export type PatientUpdate = z.infer<typeof patientUpdateSchema>;
