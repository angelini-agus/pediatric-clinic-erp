import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';

import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { StaffCreateDto } from './dto/staff-create.dto.js';

import type { JwtPayload } from './jwt.strategy.js';
import type { LoginResponse } from '@pediatric-erp/schemas';
import type { FastifyRequest } from 'fastify';

/**
 * AuthController — authentication endpoints.
 *
 * Base path: /api/v1/auth
 *
 * Endpoints:
 *  POST /api/v1/auth/login           - Authenticate a user and issue a JWT (public)
 *  POST /api/v1/auth/register        - Patient self-registration (public, always PATIENT)
 *  POST /api/v1/auth/staff           - Staff creation (ADMIN/SUPER_ADMIN only)
 *  POST /api/v1/auth/change-password - Change own password (any authenticated user)
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Validates email + password and returns a signed JWT.
   * Public route (no token required) — bypasses the global guard.
   *
   * Rate-limited to 5 attempts per minute per IP to mitigate brute-force
   * password guessing. The global ThrottlerGuard default limit (30/min)
   * applies to all other endpoints; this endpoint has a tighter bucket.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate a user',
    description:
      'Receives email and password, verifies them against the database using bcrypt, and returns a signed JWT access token.',
  })
  @ApiOkResponse({
    description: 'Login successful. Returns JWT access token and user info.',
  })
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/register
   * Patient self-registration. Creates a PATIENT account and returns a
   * signed JWT so the client can auto-login after signup.
   *
   * SECURITY RULE: the public endpoint always creates PATIENT accounts —
   * staff (DOCTOR/SECRETARY/ADMIN) is created via POST /auth/staff by an
   * authenticated admin.
   *
   * Throws 409 if the email is already taken.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new patient',
    description:
      'Creates a patient account with the provided credentials and returns a signed JWT for immediate session establishment.',
  })
  @ApiCreatedResponse({
    description: 'Patient registered. Returns JWT access token and user info.',
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
  })
  register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }

  /**
   * POST /api/v1/auth/staff
   * Admin-only staff creation (DOCTOR/SECRETARY/ADMIN).
   *
   * The global JwtAuthGuard requires a valid token and RolesGuard enforces
   * @Roles('ADMIN', 'SUPER_ADMIN') — anonymous callers get 401, staff roles
   * without permission get 403. The role is validated by staffCreateSchema
   * (PATIENT/SUPER_ADMIN are structurally rejected).
   *
   * Throws 409 if the email is already taken.
   */
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a staff user (admin only)',
    description:
      'Creates a professional account (ADMIN, DOCTOR or SECRETARY) with the provided credentials. Requires an authenticated ADMIN or SUPER_ADMIN.',
  })
  @ApiCreatedResponse({
    description: 'Staff user created. Returns JWT access token and user info.',
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
  })
  createStaff(@Body() dto: StaffCreateDto): Promise<LoginResponse> {
    return this.authService.createStaff(dto);
  }

  /**
   * POST /api/v1/auth/change-password
   * Changes the password of the authenticated user.
   *
   * Requires a valid token (any role). The user must prove knowledge of the
   * current password — the endpoint is rate-limited to mitigate brute-force
   * attempts against a stolen session.
   *
   * Note: the JWT is stateless and remains valid until it expires (7d); this
   * endpoint does not invalidate existing sessions.
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiOperation({
    summary: 'Change own password',
    description:
      'Verifies the current password and replaces it with the new one. Requires an authenticated user.',
  })
  @ApiOkResponse({
    description: 'Password updated.',
  })
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() request: FastifyRequest & { user: JwtPayload },
  ): Promise<{ message: string }> {
    return this.authService.changePassword(request.user.sub, dto);
  }
}
