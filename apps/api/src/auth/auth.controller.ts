import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../common/decorators/public.decorator.js';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

import type { LoginResponse } from '@pediatric-erp/schemas';

/**
 * AuthController — authentication endpoints.
 *
 * Base path: /api/v1/auth
 *
 * Endpoints:
 *  POST /api/v1/auth/login    - Authenticate a user and issue a JWT (public)
 *  POST /api/v1/auth/register - Register a new staff user and issue a JWT (public)
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
   * Registers a new user and returns a signed JWT so the client can
   * auto-login after signup. Defaults role to DOCTOR (public registration
   * never elevates to ADMIN/SUPER_ADMIN).
   *
   * Throws 409 if the email is already taken.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new staff user',
    description:
      'Creates a new doctor account with the provided credentials and returns a signed JWT for immediate session establishment.',
  })
  @ApiCreatedResponse({
    description: 'User registered. Returns JWT access token and user info.',
  })
  @ApiConflictResponse({
    description: 'Email already registered.',
  })
  register(@Body() dto: RegisterDto): Promise<LoginResponse> {
    return this.authService.register(dto);
  }
}
