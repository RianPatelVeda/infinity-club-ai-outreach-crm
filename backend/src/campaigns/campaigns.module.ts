import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { EmailService } from './email.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, EmailService, SupabaseService],
})
export class CampaignsModule {}
