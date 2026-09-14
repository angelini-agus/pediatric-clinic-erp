import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';

import type { JwtPayload } from './jwt.strategy.js';
import type { Login, LoginResponse, Register } from '@pediatric-erp/schemas';

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

  /**
   * Registers a new staff user (doctor by default) and immediately returns
   * a signed JWT so the client can auto-login after signup.
   *
   * Steps:
   *  1. Verify email uniqueness (excluding soft-deleted records).
   *  2. Hash the password with bcrypt (cost factor 10 — matches existing
   *     hash strategy in seed scripts).
   *  3. Persist the user with role = DOCTOR (public registration never
   *     elevates to ADMIN/SUPER_ADMIN — only admins can do that).
   *  4. Sign and return a JWT identical to the login flow.
   *
   * Throws `ConflictException` (HTTP 409) if the email is already taken.
   */
  async register(dto: Register): Promise<LoginResponse> {
    const existing = await this.prisma.client.user.findFirst({
      where: { email: dto.email, deletedAt: null },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        fullName: dto.fullName,
        // Public registration never elevates to ADMIN/SUPER_ADMIN —
        // only admins can promote users via internal endpoints.
        role: 'DOCTOR',
      },
    });

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
