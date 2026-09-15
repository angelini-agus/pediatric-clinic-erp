import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';

import { PrismaService } from '../prisma/prisma.service.js';

import type { JwtPayload } from './jwt.strategy.js';
import type {
  AuthRole,
  ChangePassword,
  Login,
  LoginResponse,
  Register,
  StaffCreate,
} from '@pediatric-erp/schemas';

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
   * Public self-registration — ALWAYS creates a PATIENT account.
   *
   * SECURITY RULE: public registration can never create staff accounts.
   * Professionals (DOCTOR/SECRETARY/ADMIN) are created by an admin via
   * `createStaff` (POST /api/v1/auth/staff, admin-only).
   *
   * Throws `ConflictException` (HTTP 409) if the email is already taken.
   */
  async register(dto: Register): Promise<LoginResponse> {
    return this.createUserWithToken(dto, 'PATIENT');
  }

  /**
   * Admin-only staff creation. The role is already validated against
   * STAFF_ROLES by `staffCreateSchema`, so PATIENT and SUPER_ADMIN are
   * structurally impossible here.
   *
   * Throws `ConflictException` (HTTP 409) if the email is already taken.
   */
  async createStaff(dto: StaffCreate): Promise<LoginResponse> {
    return this.createUserWithToken(dto, dto.role, {
      specialty: dto.specialty ?? null,
      medicalLicense: dto.medicalLicense ?? null,
    });
  }

  /**
   * Changes the password of the authenticated user.
   *
   * Steps:
   *  1. Load the user (excluding soft-deleted records).
   *  2. Verify the current password with bcrypt (proof of knowledge).
   *  3. Hash and persist the new password (same cost factor as register).
   *
   * Throws `UnauthorizedException` (HTTP 401) when the current password
   * is wrong — deliberately the same error class as a bad login so the
   * endpoint does not leak which part failed.
   */
  async changePassword(userId: string, dto: ChangePassword): Promise<{ message: string }> {
    const user = await this.prisma.client.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });

    return { message: 'Contraseña actualizada' };
  }

  /**
   * Shared create-user flow:
   *  1. Verify email uniqueness (excluding soft-deleted records).
   *  2. Hash the password with bcrypt (cost factor 10 — matches the seed).
   *  3. Persist the user with the given role and optional professional data.
   *  4. Sign and return a JWT identical to the login flow.
   */
  private async createUserWithToken(
    dto: Pick<Register, 'fullName' | 'email' | 'password'>,
    role: AuthRole,
    professionalData: { specialty: string | null; medicalLicense: string | null } = {
      specialty: null,
      medicalLicense: null,
    },
  ): Promise<LoginResponse> {
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
        role,
        specialty: professionalData.specialty,
        medicalLicense: professionalData.medicalLicense,
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
