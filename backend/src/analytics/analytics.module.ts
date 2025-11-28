import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, SupabaseService],
})
export class AnalyticsModule {}
