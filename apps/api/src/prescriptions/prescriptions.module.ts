import { Module } from '@nestjs/common';

import { PdfGeneratorService } from './pdf-generator.service.js';
import { PrescriptionsController } from './prescriptions.controller.js';
import { PrescriptionsService } from './prescriptions.service.js';

/**
 * PrescriptionsModule — domain module for medical prescriptions & PDF generation.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 */
@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PdfGeneratorService],
  exports: [PrescriptionsService, PdfGeneratorService],
})
export class PrescriptionsModule {}
