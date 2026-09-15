import { portalAppointmentRequestSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for POST /api/v1/portal/appointments.
 *
 * Derived from `portalAppointmentRequestSchema` (single source of truth):
 * the patient only sends the desired slot, reason and notes. The patient
 * record and the doctor are resolved server-side.
 */
export class PortalAppointmentRequestDto extends createZodDto(portalAppointmentRequestSchema) {}
