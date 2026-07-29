import { createZodDto } from 'nestjs-zod';
import { medicalRecordCreateSchema } from '@pediatric-erp/schemas';

/**
 * DTO for creating a medical record (clinical evolution entry).
 *
 * Uses createZodDto from nestjs-zod to automatically derive:
 *  - Validation via ZodValidationPipe
 *  - OpenAPI/Swagger schema via patchNestJsSwagger()
 *  - TypeScript typing via z.infer
 *
 * FORBIDDEN: class-validator, class-transformer
 */
export class CreateMedicalRecordDto extends createZodDto(
  medicalRecordCreateSchema,
) {}
