import { Module } from '@nestjs/common';

import { AuditService } from './audit.service.js';

/**
 * AuditModule — append-only audit trail infrastructure.
 *
 * Exports `AuditService` so any domain module (patients, appointments,
 * medical records, prescriptions) can record compliance events.
 * PrismaService is injected from PrismaModule (@Global).
 */
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
