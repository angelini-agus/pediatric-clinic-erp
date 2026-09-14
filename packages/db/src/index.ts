import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient Singleton for development environments.
 *
 * In Next.js and NestJS with hot-reload, code changes can instantiate
 * multiple PrismaClient instances and exhaust connection pool limits.
 * This pattern avoids this by storing the instance in `globalThis`.
 *
 * In production: a single instance is created directly.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

  /**
   * AUDIT MIDDLEWARE PLACEHOLDER
   *
   * TODO (Domain Sprint): Add Prisma middleware for:
   * 1. Automatic soft-delete (intercept delete → update { deletedAt: new Date() })
   * 2. Automatic auditing (intercept create/update/delete → write to AuditLog)
   *
   * Example structure:
   * client.$use(async (params, next) => {
   *   if (params.action === 'delete') {
   *     params.action = 'update';
   *     params.args.data = { deletedAt: new Date() };
   *   }
   *   return next(params);
   * });
   */

  return client;
}

const prisma: PrismaClient =
  process.env['NODE_ENV'] === 'production'
    ? createPrismaClient()
    : (globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient()));

export { prisma };
export type { PrismaClient, ClinicSettings } from '@prisma/client';

// Re-export Prisma namespace for type utilities
// Usage: Prisma.<Model>GetPayload<{ include: { ... } }>
export { Prisma } from '@prisma/client';
