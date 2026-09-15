import { z } from 'zod';

/**
 * Zod Schemas for the patient portal.
 *
 * The portal is consumed by users with role PATIENT. The patient record is
 * always resolved server-side from the JWT (`userId`) — never trusted from
 * the client (see PortalService).
 */

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
