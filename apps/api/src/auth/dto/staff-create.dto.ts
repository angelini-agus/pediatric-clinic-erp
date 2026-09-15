import { staffCreateSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for admin-only staff creation (POST /api/v1/auth/staff).
 *
 * Derived from `staffCreateSchema` (single source of truth): same fields
 * as patient registration plus a validated staff role (ADMIN/DOCTOR/
 * SECRETARY). PATIENT and SUPER_ADMIN are rejected by the schema.
 */
export class StaffCreateDto extends createZodDto(staffCreateSchema) {}
