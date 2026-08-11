import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AuthRole } from '@pediatric-erp/schemas';

/**
 * Shape of the signed JWT payload. `sub` is the user id.
 */
export type JwtPayload = {
  readonly sub: string;
  readonly email: string;
  readonly role: AuthRole;
}

/**
 * JwtStrategy — verifies the Bearer token signature/expiry using
 * passport-jwt. On success, the validated payload is attached to
 * `request.user` and consumed by guards/controllers.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // Passport-jwt guarantees the token is valid & not expired here.
    return payload;
  }
}