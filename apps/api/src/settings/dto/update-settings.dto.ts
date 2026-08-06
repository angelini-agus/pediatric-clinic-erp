import { createZodDto } from 'nestjs-zod';
import { clinicSettingsUpdateSchema } from '@pediatric-erp/schemas';

export class UpdateSettingsDto extends createZodDto(clinicSettingsUpdateSchema) {}
