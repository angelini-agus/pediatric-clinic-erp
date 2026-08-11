import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';


import { Public } from '../common/decorators/public.decorator.js';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

import type { LoginResponse } from '@pediatric-erp/schemas';

/**
 * AuthController — authentication endpoints.
 *
 * Base path: /api/v1/auth
 *
 * Endpoints:
 *  POST /api/v1/auth/login  - Authenticate a user and issue a JWT (public)
 */
@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Validates email + password and returns a signed JWT.
   * Public route (no token required) — bypasses the global guard.
   */
  @Public()
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
}