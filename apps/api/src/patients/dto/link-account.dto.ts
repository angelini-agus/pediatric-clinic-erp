import { linkPatientAccountSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for linking a patient record to a portal account
 * (POST /api/v1/patients/:id/account).
 *
 * Derived from `linkPatientAccountSchema` (single source of truth): the
 * staff member identifies the account by email; the API resolves it.
 */
export class LinkAccountDto extends createZodDto(linkPatientAccountSchema) {}
