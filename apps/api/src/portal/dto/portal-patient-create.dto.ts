import { portalPatientCreateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for POST /api/v1/portal/patient (self-onboarding).
 *
 * Derived from `portalPatientCreateSchema` (single source of truth): the
 * patient's minimum data. The DNI is optional — the clinic completes it
 * during the first visit.
 */
export class PortalPatientCreateDto extends createZodDto(portalPatientCreateSchema) {}
