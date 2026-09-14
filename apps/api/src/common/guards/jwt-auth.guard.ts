import { type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * JwtAuthGuard — global authentication guard.
 *
 * Validates the Bearer JWT token on every request (using the `jwt` strategy).
 * Endpoints marked with @Public() are exempt.
 * Rejects unauthenticated requests with HTTP 401 Unauthorized.
 *
 * Registered as APP_GUARD in AppModule (security by default).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  override handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Unauthenticated. A valid JWT token is required.');
    }
    return user;
  }
}
