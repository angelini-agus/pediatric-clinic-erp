import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { PrismaService } from '../prisma/prisma.service.js';

import type { Prisma } from '@pediatric-erp/db';

/**
 * Minimal input for an append-only AuditLog entry.
 *
 * HIPAA/GDPR RULES:
 * - `userId` is REQUIRED: the actor must always be captured.
 * - `payload` is for NON-SENSITIVE metadata (e.g. status transitions).
 *   NEVER log PHI (diagnoses, document numbers, guardian data, etc.)
 *   inside the payload column.
 */
export type AuditLogInput = {
  /** Machine-readable action, e.g. 'CREATE_PATIENT' (UPPER_SNAKE_CASE). */
  action: string;
  /** Prisma model name, e.g. 'Patient'. */
  entityName: string;
  /** ID of the entity the action targeted. */
  entityId: string;
  /** ID of the authenticated user performing the action (actor). */
  userId: string;
  /** Patient affected by the action, when applicable. */
  patientId?: string;
  /** Non-sensitive metadata (must NOT contain PHI). */
  payload?: Prisma.InputJsonValue;
};

/**
 * AuditService — append-only audit trail (Law 26.529 / HIPAA / GDPR).
 *
 * CONTRACT: `log()` NEVER throws. An audit write failure must not
 * break the business operation it describes; the event is logged as an
 * internal error instead so it can be correlated afterward.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectPinoLogger(AuditService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.client.auditLog.create({
        data: {
          action: input.action,
          entityName: input.entityName,
          entityId: input.entityId,
          userId: input.userId,
          patientId: input.patientId ?? null,
          ...(input.payload !== undefined ? { payload: input.payload } : {}),
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        { err: error, audit: input },
        'Audit log write failed — business operation continued without trail entry',
      );
    }
  }
}
