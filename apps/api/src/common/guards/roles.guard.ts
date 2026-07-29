import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';

import { ROLES_KEY, type AppRole } from '../decorators/roles.decorator.js';

/**
 * Type representing the JWT payload expected on the request
 * after passing through AuthGuard (to be implemented in Auth Sprint).
 *
 * RULE: Derive types with z.infer when JWT is validated with Zod.
 * This is a provisional structure.
 */
type JwtUser = {
  readonly sub: string;
  readonly email: string;
  readonly role: AppRole;
};

/**
 * Extended FastifyRequest to include authenticated user.
 */
type AuthenticatedRequest = FastifyRequest & {
  user?: JwtUser;
};

/**
 * RolesGuard — Role-Based Access Control (RBAC) Guard
 *
 * Verifies that the authenticated user has at least one of the roles
 * required by the endpoint marked with @Roles(...).
 *
 * IMPORTANT: This guard must run AFTER AuthGuard (JWT),
 * which is responsible for populating `request.user`.
 *
 * Usage:
 * 1. Apply globally in AppModule or specifically per module/controller.
 * 2. Mark endpoints with @Roles('admin', 'doctor').
 * 3. If endpoint has no @Roles, guard allows access (public).
 *
 * @example
 * ```typescript
 * // In a module:
 * providers: [{ provide: APP_GUARD, useClass: RolesGuard }]
 *
 * // In a controller:
 * @UseGuards(AuthGuard('jwt'), RolesGuard)
 * @Roles('admin')
 * @Get('private')
 * getPrivateData() { ... }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from metadata of handler or class
    const requiredRoles = this.reflector.getAllAndOverride<AppRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles(), endpoint is public — pass through
    if (requiredRoles === undefined || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    // If no user on request, AuthGuard did not run or failed
    if (user === undefined) {
      throw new UnauthorizedException('Unauthenticated. A valid JWT token is required.');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Requires one of the following roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

