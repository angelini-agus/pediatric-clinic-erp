import { Controller, Get, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * GET /api/v1/settings
   * Returns current clinic settings, or null if not yet configured.
   */
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  /**
   * PATCH /api/v1/settings
   * Upserts clinic settings. Body validated by global ZodValidationPipe.
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.upsertSettings(dto);
  }
}
