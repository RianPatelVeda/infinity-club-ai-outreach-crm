import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardMetrics() {
    return await this.analyticsService.getDashboardMetrics();
  }

  @Get('email-performance')
  async getEmailPerformance() {
    return await this.analyticsService.getEmailPerformance();
  }

  @Get('scraping-stats')
  async getScrapingStats() {
    return await this.analyticsService.getScrapingStats();
  }
}
