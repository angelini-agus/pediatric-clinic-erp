import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto.js';

/**
 * AnalyticsController — Real-time metrics and statistics for dashboard cards.
 *
 * Base path: /api/v1/analytics
 *
 * Endpoints:
 *  GET /api/v1/analytics/dashboard - Real-time dashboard metrics (200)
 */
@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/v1/analytics/dashboard
   * Returns real-time metrics for dashboard cards: total active patients, today's appointments, and monthly completed appointments.
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard analytics',
    description:
      'Returns real-time metrics for dashboard cards: total active patients, today\'s appointments count, and monthly completed appointments count.',
  })
  @ApiOkResponse({
    description: 'Dashboard analytics retrieved successfully.',
    type: DashboardAnalyticsDto,
  })
  getDashboardMetrics(): Promise<DashboardAnalyticsDto> {
    return this.analyticsService.getDashboardMetrics();
  }
}
