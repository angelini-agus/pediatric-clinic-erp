import { createZodDto } from 'nestjs-zod';
import { registerSchema } from '@pediatric-erp/schemas';

/**
 * DTO for public user registration.
 *
 * Derived from `registerSchema` (single source of truth) so validation
 * and TypeScript types stay aligned with the client-side form.
 */
export class RegisterDto extends createZodDto(registerSchema) {}
