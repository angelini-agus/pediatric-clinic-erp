import { Module } from '@nestjs/common';

import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';

/**
 * PatientsModule — domain module for patient management.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 */
@Module({
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}

