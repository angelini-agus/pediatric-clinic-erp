import { SetMetadata } from '@nestjs/common';

/**
 * Roles available in the pediatric ERP system.
 *
 * RULE: Use Discriminated Union to model complex permissions.
 * When adding a new role, update it in RolesGuard as well.
 *
 * Current roles:
 * - 'super_admin': Total system access (IT, clinic owners)
 * - 'admin': Administrative management (senior secretaries)
 * - 'doctor': Access to medical records and own appointments
 * - 'secretary': Management of appointments and basic patient data
 * - 'patient': Read-only access to own data
 */
export type AppRole = 'super_admin' | 'admin' | 'doctor' | 'secretary' | 'patient';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator to mark endpoints with required roles.
 *
 * @example
 * ```typescript
 * @Get('admin-only')
 * @Roles('admin', 'super_admin')
 * getAdminData() { ... }
 * ```
 */
export const Roles = (...roles: AppRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

