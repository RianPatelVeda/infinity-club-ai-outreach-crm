import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScrapeModule } from './scrape/scrape.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScrapeModule,
    CampaignsModule,
    LeadsModule,
  ],
})
export class AppModule {}
