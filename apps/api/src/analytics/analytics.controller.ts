import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../common/decorators/roles.decorator.js';

import { AnalyticsService } from './analytics.service.js';
import { DashboardAnalyticsDto } from './dto/dashboard-analytics.dto.js';

/**
 * AnalyticsController — Real-time operational metrics for dashboard cards.
 *
 * Base path: /api/v1/analytics
 *
 * Endpoints:
 *  GET /api/v1/analytics/dashboard - Real-time dashboard metrics (200)
 *
 * RBAC: Operational metrics are part of the daily workflow for every
 * staff role (reception, medical, administrative).
 */
@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
@Roles('SECRETARY', 'ADMIN', 'DOCTOR', 'SUPER_ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/v1/analytics/dashboard
   * Returns real-time metrics for the 4 operational dashboard cards: next patient, appointment funnel, unsigned records, and canceled appointments.
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard operational analytics',
    description:
      'Returns real-time metrics for dashboard cards: next patient today, appointment funnel (total/completed/waiting), unsigned medical records today, and canceled appointments today.',
  })
  @ApiOkResponse({
    description: 'Dashboard operational analytics retrieved successfully.',
    type: DashboardAnalyticsDto,
  })
  getDashboardMetrics(): Promise<DashboardAnalyticsDto> {
    return this.analyticsService.getDashboardMetrics();
  }
}
