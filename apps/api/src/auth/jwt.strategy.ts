import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../prisma/prisma.service.js';

import type { AuthRole } from '@pediatric-erp/schemas';

/**
 * Shape of the signed JWT payload. `sub` is the user id.
 */
export type JwtPayload = {
  readonly sub: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: AuthRole;
};

/**
 * JwtStrategy — verifies the Bearer token signature/expiry using
 * passport-jwt. On success, the validated payload is attached to
 * `request.user` and consumed by guards/controllers.
 *
 * SESSION REVOCATION (HIPAA/GDPR):
 * JWT is stateless, so signature + expiry are not enough to revoke a
 * session. Before accepting the token, a fast index lookup (PK on
 * `users.id` + the `users_deletedAt_idx` index) confirms the subject
 * still exists and has NOT been soft-deleted. If the account was
 * removed or deactivated, every outstanding token is rejected with 401
 * — no client-side blacklist required.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Fast DB existence/activity check (revocation).
    // `deletedAt: null` — a soft-deleted user must lose access instantly.
    const user = await this.prisma.client.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true },
    });

    if (user === null) {
      throw new UnauthorizedException(
        'Session revoked: the user account no longer exists or was deactivated.',
      );
    }

    // Passport-jwt guarantees the token is valid & not expired here.
    return payload;
  }
}
