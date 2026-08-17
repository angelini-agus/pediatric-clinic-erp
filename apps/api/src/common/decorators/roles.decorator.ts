import { SetMetadata } from '@nestjs/common';

/**
 * Roles available in the pediatric ERP system.
 *
 * RULE: Use Discriminated Union to model complex permissions.
 * When adding a new role, update it in RolesGuard as well.
 *
 * Values MUST match the `UserRole` enum in `packages/db/prisma/schema.prisma`
 * character-for-character (UPPER_SNAKE_CASE). The JWT payload signed by
 * the auth service carries the Prisma enum value directly; if `AppRole`
 * diverges, `RolesGuard` would silently fail to match (string comparison).
 *
 * Current roles:
 * - SUPER_ADMIN: Total system access (IT, clinic owners)
 * - ADMIN:       Administrative management (senior secretaries)
 * - DOCTOR:      Access to medical records and own appointments
 * - SECRETARY:   Management of appointments and basic patient data
 * - PATIENT:     Read-only access to own data
 */
export type AppRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'DOCTOR'
  | 'SECRETARY'
  | 'PATIENT';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator to mark endpoints with required roles.
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @Roles('ADMIN', 'SUPER_ADMIN')
 * getAdminData() { ... }
 * ```
 */
export const Roles = (...roles: AppRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

