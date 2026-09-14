import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks an endpoint as publicly accessible, bypassing the global JwtAuthGuard.
 *
 * Use ONLY for intentionally public routes (e.g. POST /auth/login, health checks).
 * Every non-decorated endpoint is protected by default (security by default).
 *
 * @example
 * ```typescript
 * @Public()
 * @Post('login')
 * login() { ... }
 * ```
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
