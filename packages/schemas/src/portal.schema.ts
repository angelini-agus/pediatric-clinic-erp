import { z } from 'zod';

import { biologicalSexSchema, guardianRelationshipSchema } from './patient.schema.js';

/**
 * Zod Schemas for the patient portal.
 *
 * The portal is consumed by users with role PATIENT. The patient record is
 * always resolved server-side from the JWT (`userId`) — never trusted from
 * the client (see PortalService).
 */

/**
 * POST /api/v1/portal/patient — self-onboarding: a PATIENT account creates
 * the ficha of their child and gets linked to it automatically.
 *
 * Differences from the staff `patientCreateSchema`:
 *  - `documentNumber` is optional (the clinic completes it later).
 *  - `guardianEmail` is not accepted: it defaults to the account email
 *    server-side.
 */
export const portalPatientCreateSchema = z.object({
  firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().trim().min(1, 'El apellido es obligatorio').max(100),
  documentNumber: z
    .string()
    .trim()
    .max(20, 'El documento no puede superar los 20 caracteres')
    .optional(),
  dateOfBirth: z.coerce.date().refine((date) => date <= new Date(), {
    message: 'La fecha de nacimiento no puede ser futura',
  }),
  biologicalSex: biologicalSexSchema,
  guardianFullName: z.string().trim().min(1, 'El nombre del tutor es obligatorio').max(200),
  guardianPhone: z.string().trim().min(1, 'El teléfono es obligatorio').max(30),
  guardianRelationship: guardianRelationshipSchema,
});
export type PortalPatientCreate = z.infer<typeof portalPatientCreateSchema>;

/**
 * POST /api/v1/patients/:id/account — staff links a patient record to a
 * PATIENT user account, matched by email.
 */
export const linkPatientAccountSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .max(200)
    .transform((value) => value.trim().toLowerCase()),
});
export type LinkPatientAccount = z.infer<typeof linkPatientAccountSchema>;

/**
 * POST /api/v1/portal/appointments — a patient requests an appointment.
 *
 * Only the requested slot, reason and notes come from the client: the
 * patient record and the doctor are resolved server-side.
 */
export const portalAppointmentRequestSchema = z.object({
  dateTime: z.coerce.date(),
  type: z.string().trim().min(1, 'Indicá el motivo de la consulta').max(100),
  notes: z.string().trim().max(500).optional(),
});
export type PortalAppointmentRequest = z.infer<typeof portalAppointmentRequestSchema>;
