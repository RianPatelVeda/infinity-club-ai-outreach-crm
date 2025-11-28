import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [WebhooksController],
  providers: [WebhooksService, SupabaseService],
})
export class WebhooksModule {}
