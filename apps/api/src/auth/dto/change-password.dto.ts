import { changePasswordSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for the authenticated password change
 * (POST /api/v1/auth/change-password).
 *
 * Derived from `changePasswordSchema` (single source of truth): current
 * password + new password + confirmation, with the match and
 * different-from-current refinements validated server-side.
 */
export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
