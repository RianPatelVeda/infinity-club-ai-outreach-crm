import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { EmailService } from './email.service';
import { SupabaseService } from '../common/supabase.service';
import { FirebaseService } from '../common/firebase.service';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, EmailService, SupabaseService, FirebaseService],
})
export class CampaignsModule {}
