import { prescriptionCreateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for creating a medical prescription.
 *
 * Uses createZodDto from nestjs-zod to automatically derive:
 *  - Validation via ZodValidationPipe
 *  - OpenAPI/Swagger schema via patchNestJsSwagger()
 *  - TypeScript typing via z.infer
 *
 * FORBIDDEN: class-validator, class-transformer
 */
export class CreatePrescriptionDto extends createZodDto(prescriptionCreateSchema) {}
