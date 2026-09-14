import { patientCreateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for pediatric patient creation.
 *
 * Uses createZodDto from nestjs-zod to automatically derive:
 *  - Validation via ZodValidationPipe
 *  - OpenAPI/Swagger schema via patchNestJsSwagger()
 *  - TypeScript typing via z.infer
 *
 * FORBIDDEN: class-validator, class-transformer
 */
export class CreatePatientDto extends createZodDto(patientCreateSchema) {}
