import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { PdfGeneratorService } from './pdf-generator.service.js';
import { PrescriptionsController } from './prescriptions.controller.js';
import { PrescriptionsService } from './prescriptions.service.js';

/**
 * PrescriptionsModule — domain module for medical prescriptions & PDF generation.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 * SettingsModule is imported to provide SettingsService to PdfGeneratorService.
 */
@Module({
  imports: [SettingsModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PdfGeneratorService],
  exports: [PrescriptionsService, PdfGeneratorService],
})
export class PrescriptionsModule {}
