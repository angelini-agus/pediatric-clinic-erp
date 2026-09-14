import { z } from 'zod';

/**
 * Zod Schemas for Appointment model (medical appointment).
 *
 * RULE: Do not use Prisma enums directly. Discriminated values
 * are validated as string unions in Zod.
 */

export const APPOINTMENT_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const;

export const appointmentStatusSchema = z.enum(APPOINTMENT_STATUSES);
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;

// ── Create ───────────────────────────────────────────────────
export const appointmentCreateSchema = z.object({
  dateTime: z.coerce.date(),
  type: z.string().min(1).max(100),
  notes: z.string().max(1000).nullish(),
  status: appointmentStatusSchema.default('SCHEDULED'),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
});
export type AppointmentCreate = z.infer<typeof appointmentCreateSchema>;

// ── Update Status ─────────────────────────────────────────────
export const appointmentUpdateStatusSchema = z.object({
  status: appointmentStatusSchema,
});
export type AppointmentUpdateStatus = z.infer<typeof appointmentUpdateStatusSchema>;

// ── Update ───────────────────────────────────────────────────
export const appointmentUpdateSchema = z.object({
  dateTime: z.coerce.date().optional(),
  type: z.string().min(1).max(100).optional(),
  notes: z.string().max(1000).nullish(),
  status: appointmentStatusSchema.optional(),
  patientId: z.string().min(1).optional(),
  doctorId: z.string().min(1).optional(),
});
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>;
