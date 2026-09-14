import { appointmentCreateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for creating a medical appointment.
 *
 * Uses createZodDto from nestjs-zod to automatically derive:
 *  - Validation via ZodValidationPipe
 *  - OpenAPI/Swagger schema via patchNestJsSwagger()
 *  - TypeScript typing via z.infer
 *
 * FORBIDDEN: class-validator, class-transformer
 */
export class CreateAppointmentDto extends createZodDto(appointmentCreateSchema) {}
