import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScrapeModule } from './scrape/scrape.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LeadsModule } from './leads/leads.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScrapeModule,
    CampaignsModule,
    LeadsModule,
    WebhooksModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
