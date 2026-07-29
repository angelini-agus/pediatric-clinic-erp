import { createZodDto } from 'nestjs-zod';
import { patientUpdateSchema } from '@pediatric-erp/schemas';

/**
 * DTO for partial update of a pediatric patient.
 */
export class UpdatePatientDto extends createZodDto(patientUpdateSchema) {}

