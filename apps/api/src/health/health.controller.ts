import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  type HealthCheckResult,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

import { Public } from '../common/decorators/public.decorator.js';

/**
 * Health Check Controller
 *
 * Endpoint: GET /api/v1/health
 *
 * Verifies system status. Includes:
 * - Heap memory (limit: 250MB)
 * - RSS memory (limit: 500MB)
 *
 * TODO (Domain Sprint): Add indicators:
 * - PrismaHealthIndicator (database connection)
 *
 * Example successful response:
 * {
 *   "status": "ok",
 *   "info": { "memory_heap": { "status": "up" }, "memory_rss": { "status": "up" } },
 *   "error": {},
 *   "details": { ... }
 * }
 */
@ApiTags('health')
@Public()
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'System health check',
    description: 'Checks memory status and service connections.',
  })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Heap memory: triggers alert if exceeds 250MB
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkHeap('memory_heap', 250 * 1024 * 1024),
      // RSS memory: triggers alert if exceeds 500MB
      async (): Promise<HealthIndicatorResult> =>
        this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }
}
