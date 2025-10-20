import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { SupabaseService } from '../common/supabase.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, SupabaseService],
})
export class LeadsModule {}
