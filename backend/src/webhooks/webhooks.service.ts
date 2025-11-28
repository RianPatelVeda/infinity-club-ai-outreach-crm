import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class WebhooksService {
  constructor(private supabaseService: SupabaseService) {}

  async processSendGridEvent(event: any) {
    const supabase = this.supabaseService.getClient();

    try {
      // Extract event data
      const {
        email,
        event: eventType,
        timestamp,
        campaign_id,
        template_type,
        url,
        ip,
        useragent,
        reason,
      } = event;

      console.log(`📊 Processing ${eventType} event for ${email}`);

      // Find the lead by email
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .single();

      if (!lead) {
        console.log(`⚠️  Lead not found for email: ${email}`);
        return;
      }

      // Create email tracking record
      await supabase.from('email_tracking').insert({
        lead_id: lead.id,
        campaign_id: campaign_id || null,
        event_type: eventType,
        timestamp: new Date(timestamp * 1000).toISOString(),
        email: email,
        url: url || null,
        ip_address: ip || null,
        user_agent: useragent || null,
        reason: reason || null,
        metadata: event,
      });

      // Update outreach history with engagement data
      if (campaign_id) {
        const updates: any = {};

        switch (eventType) {
          case 'open':
            updates.opened_at = new Date(timestamp * 1000).toISOString();
            updates.opened = true;
            break;
          case 'click':
            updates.clicked_at = new Date(timestamp * 1000).toISOString();
            updates.clicked = true;
            break;
          case 'bounce':
            updates.bounced_at = new Date(timestamp * 1000).toISOString();
            updates.bounced = true;
            break;
          case 'delivered':
            updates.delivered_at = new Date(timestamp * 1000).toISOString();
            updates.delivered = true;
            break;
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('outreach_history')
            .update(updates)
            .eq('lead_id', lead.id)
            .eq('campaign_id', campaign_id);
        }
      }

      console.log(`✅ Processed ${eventType} event for lead ${lead.id}`);
    } catch (error) {
      console.error('Error processing SendGrid event:', error);
    }
  }
}
