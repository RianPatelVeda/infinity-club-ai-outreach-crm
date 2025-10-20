import { Module } from '@nestjs/common';
import { ScrapeController } from './scrape.controller';
import { ScrapeService } from './scrape.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [ScrapeController],
  providers: [ScrapeService, SupabaseService],
})
export class ScrapeModule {}
