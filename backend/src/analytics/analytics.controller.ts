import { Controller, Get, Post, Put, Query, Body } from '@nestjs/common';
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

  @Get('notifications')
  async getNotifications() {
    return await this.analyticsService.getNotifications();
  }

  @Get('search')
  async search(@Query('term') term: string) {
    return await this.analyticsService.search(term || '');
  }

  @Get('leads')
  async getLeads() {
    return await this.analyticsService.getLeads();
  }

  @Get('kanban-stages')
  async getKanbanStages() {
    return await this.analyticsService.getKanbanStages();
  }

  @Get('lead-kanban')
  async getLeadKanban() {
    return await this.analyticsService.getLeadKanban();
  }

  @Post('kanban-stages/setup')
  async setupKanbanStages() {
    return await this.analyticsService.setupKanbanStages();
  }

  @Put('lead-kanban/move')
  async moveLeadKanban(
    @Body() body: { leadId: string; toStageId: string },
  ) {
    return await this.analyticsService.moveLeadKanban(body.leadId, body.toStageId);
  }

  @Get('kanban-data')
  async getKanbanData() {
    return await this.analyticsService.getKanbanData();
  }

  @Get('outreach-history')
  async getOutreachHistory(@Query('leadIds') leadIds: string) {
    const ids = leadIds ? leadIds.split(',') : [];
    return await this.analyticsService.getOutreachHistory(ids);
  }
}
