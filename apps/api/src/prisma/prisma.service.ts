import { Injectable, type OnModuleInit } from '@nestjs/common';

import { prisma } from '@pediatric-erp/db';
import type { PrismaClient } from '@pediatric-erp/db';

/**
 * PrismaService — wrapper NestJS del cliente Prisma singleton.
 *
 * Usa el singleton exportado por @pediatric-erp/db para no crear
 * múltiples instancias de PrismaClient durante el hot-reload de NestJS.
 *
 * Al ser registrado en PrismaModule como @Global(), cualquier módulo
 * puede inyectarlo sin necesidad de importar PrismaModule explícitamente.
 */
@Injectable()
export class PrismaService implements OnModuleInit {
  /**
   * Referencia directa al singleton de PrismaClient.
   * Los servicios usan: `this.prisma.client.patient.findMany(...)`
   */
  readonly client: PrismaClient = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }
}
