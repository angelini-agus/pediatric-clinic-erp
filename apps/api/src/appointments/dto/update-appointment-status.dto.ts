import { appointmentUpdateStatusSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for updating an appointment's status.
 */
export class UpdateAppointmentStatusDto extends createZodDto(appointmentUpdateStatusSchema) {}
