import { patientUpdateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for partial update of a pediatric patient.
 */
export class UpdatePatientDto extends createZodDto(patientUpdateSchema) {}
