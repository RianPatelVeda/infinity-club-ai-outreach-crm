import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { EmailService } from './email.service';

@Injectable()
export class CampaignsService {
  constructor(
    private supabaseService: SupabaseService,
    private emailService: EmailService,
  ) {}

  async createAndSendCampaign(
    leadIds: string[],
    subject: string,
    content: string,
    sendNow: boolean,
  ) {
    const supabase = this.supabaseService.getClient();

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        name: `Campaign ${new Date().toISOString()}`,
        subject,
        content,
        status: sendNow ? 'sending' : 'scheduled',
        total_recipients: leadIds.length,
      })
      .select()
      .single();

    if (campaignError) {
      throw new Error(`Failed to create campaign: ${campaignError.message}`);
    }

    // Fetch leads
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds);

    if (leadsError) {
      throw new Error(`Failed to fetch leads: ${leadsError.message}`);
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send emails
    for (const lead of leads) {
      if (!lead.email) {
        failedCount++;
        continue;
      }

      // Replace variables in content
      const personalizedContent = this.emailService.replaceVariables(content, {
        firstName: lead.name.split(' ')[0],
        companyName: lead.name,
        yourName: 'Infinity Club Team',
      });

      const personalizedSubject = this.emailService.replaceVariables(subject, {
        firstName: lead.name.split(' ')[0],
        companyName: lead.name,
      });

      // Send email
      const success = await this.emailService.sendEmail(
        lead.email,
        personalizedSubject,
        personalizedContent,
      );

      // Create campaign recipient record
      await supabase.from('campaign_recipients').insert({
        campaign_id: campaign.id,
        lead_id: lead.id,
        status: success ? 'sent' : 'failed',
        sent_at: success ? new Date().toISOString() : null,
        error_message: success ? null : 'Failed to send email',
      });

      // Create outreach history
      await supabase.from('outreach_history').insert({
        lead_id: lead.id,
        campaign_id: campaign.id,
        type: 'email',
        status: success ? 'sent' : 'failed',
        subject: personalizedSubject,
        content: personalizedContent,
        metadata: success ? {} : { error: 'Failed to send email' },
      });

      if (success) {
        sentCount++;
        // Update lead status
        await supabase
          .from('leads')
          .update({ status: 'contacted' })
          .eq('id', lead.id);
      } else {
        failedCount++;
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Update campaign stats
    await supabase
      .from('campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        failed_count: failedCount,
        delivered_count: sentCount, // Simplified for MVP
      })
      .eq('id', campaign.id);

    return {
      campaignId: campaign.id,
      sentCount,
      failedCount,
    };
  }
}
