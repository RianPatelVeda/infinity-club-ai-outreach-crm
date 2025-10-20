import { Controller, Post, Body } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('send')
  async sendCampaign(
    @Body()
    body: {
      leadIds: string[];
      subject: string;
      content: string;
      sendNow: boolean;
    },
  ) {
    const result = await this.campaignsService.createAndSendCampaign(
      body.leadIds,
      body.subject,
      body.content,
      body.sendNow,
    );

    return {
      success: true,
      campaignId: result.campaignId,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
    };
  }
}
