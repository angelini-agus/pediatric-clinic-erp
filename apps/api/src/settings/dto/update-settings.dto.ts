import { clinicSettingsUpdateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

export class UpdateSettingsDto extends createZodDto(clinicSettingsUpdateSchema) {}
