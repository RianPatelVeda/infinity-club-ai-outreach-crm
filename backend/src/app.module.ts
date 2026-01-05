import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScrapeModule } from './scrape/scrape.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LeadsModule } from './leads/leads.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FirebaseService } from './common/firebase.service';
import { FirebaseAuthGuard } from './common/firebase-auth.guard';
import { AuthController } from './common/auth.controller';

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
  controllers: [AuthController],
  providers: [
    FirebaseService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
  exports: [FirebaseService],
})
export class AppModule {}
