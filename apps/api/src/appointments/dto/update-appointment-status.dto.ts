import { createZodDto } from 'nestjs-zod';
import { appointmentUpdateStatusSchema } from '@pediatric-erp/schemas';

/**
 * DTO for updating an appointment's status.
 */
export class UpdateAppointmentStatusDto extends createZodDto(appointmentUpdateStatusSchema) {}
