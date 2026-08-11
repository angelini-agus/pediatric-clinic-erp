import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';

import type { JwtPayload } from './jwt.strategy.js';
import type { Login, LoginResponse } from '@pediatric-erp/schemas';

/**
 * AuthService — authentication business logic.
 *
 * Flow:
 *  1. Find the user by email (excluding soft-deleted records).
 *  2. Compare the plaintext password against the bcrypt hash.
 *  3. On success, sign a JWT and return it together with a safe user payload.
 *
 * SECURITY RULE: Never include the password hash in the response.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: Login): Promise<LoginResponse> {
    const user = await this.prisma.client.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}