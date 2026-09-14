import { Injectable, type OnModuleInit } from '@nestjs/common';
import { prisma } from '@pediatric-erp/db';

import type { PrismaClient } from '@pediatric-erp/db';

/**
 * PrismaService — NestJS wrapper for the singleton Prisma client.
 *
 * Uses the singleton exported by @pediatric-erp/db to avoid creating
 * multiple PrismaClient instances during NestJS hot-reloading.
 *
 * Registered in PrismaModule as @Global(), allowing any module
 * to inject it without explicitly importing PrismaModule.
 */
@Injectable()
export class PrismaService implements OnModuleInit {
  /**
   * Direct reference to the PrismaClient singleton.
   * Services use: `this.prisma.client.patient.findMany(...)`
   */
  readonly client: PrismaClient = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
}
