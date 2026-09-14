import { Body, Controller, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';

import { Roles } from '../common/decorators/roles.decorator.js';

import { UpdateSettingsDto } from './dto/update-settings.dto.js';
import { SettingsService } from './settings.service.js';

import type { ClinicSettings } from '@pediatric-erp/db';

/**
 * SettingsController — REST endpoints for clinic configuration.
 *
 * Base path: /api/v1/settings
 *
 * Endpoints:
 *  GET   /api/v1/settings - Get current clinic settings (200)
 *  PATCH /api/v1/settings - Upsert clinic settings (200)
 *
 * RBAC: All staff roles can read and update clinic configuration that
 * is not clinically sensitive (clinic name, address, phone).
 */
@Controller('settings')
@Roles('SECRETARY', 'ADMIN', 'DOCTOR', 'SUPER_ADMIN')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings
   * Returns current clinic settings, or null if not yet configured.
   */
  @Get()
  async getSettings(): Promise<ClinicSettings | null> {
    return this.settingsService.getSettings();
  }

  /**
   * PATCH /api/v1/settings
   * Upserts clinic settings. Body validated by global ZodValidationPipe.
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() dto: UpdateSettingsDto): Promise<ClinicSettings> {
    return this.settingsService.upsertSettings(dto);
  }
}
