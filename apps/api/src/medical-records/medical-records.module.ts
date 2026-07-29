import { Module } from '@nestjs/common';

import { MedicalRecordsController } from './medical-records.controller.js';
import { MedicalRecordsService } from './medical-records.service.js';

/**
 * MedicalRecordsModule — domain module for immutable clinical records.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 */
@Module({
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
