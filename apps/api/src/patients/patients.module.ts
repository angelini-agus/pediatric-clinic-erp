import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';

import { PatientsController } from './patients.controller.js';
import { PatientsService } from './patients.service.js';

/**
 * PatientsModule — domain module for patient management.
 *
 * PrismaService is automatically injected from PrismaModule (@Global).
 */
@Module({
  imports: [AuditModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}

