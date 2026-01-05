import { Controller, Post, Get, Body } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('templates')
  async getTemplates() {
    const templates = await this.campaignsService.getAvailableTemplates();
    return {
      success: true,
      templates,
    };
  }

  @Post('send')
  async sendCampaign(
    @Body()
    body: {
      leadIds: string[];
      subject: string;
      content: string;
      sendNow: boolean;
      templateType?: string;
    },
  ) {
    const result = await this.campaignsService.createAndSendCampaign(
      body.leadIds,
      body.subject,
      body.content,
      body.sendNow,
      body.templateType,
    );

    return {
      success: true,
      campaignId: result.campaignId,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    };
  }
}
