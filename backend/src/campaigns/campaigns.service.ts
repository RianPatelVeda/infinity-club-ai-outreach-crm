import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { EmailService } from './email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CampaignsService {
  constructor(
    private supabaseService: SupabaseService,
    private emailService: EmailService,
  ) {}

  private loadTemplate(templateName: string): string {
    // Use process.cwd() to get the backend folder, then go to templates
    const templatePath = path.join(
      process.cwd(),
      'templates',
      `${templateName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found at ${templatePath}`);
    }

    return fs.readFileSync(templatePath, 'utf-8');
  }

  async createAndSendCampaign(
    leadIds: string[],
    subject: string,
    content: string,
    sendNow: boolean,
    templateType?: string,
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

    // Load template if specified
    let emailContent = content;
    let emailSubject = subject;

    if (templateType) {
      try {
        emailContent = this.loadTemplate(templateType);
        // Set subject based on template type
        if (templateType === 'partner_acquisition_email') {
          emailSubject =
            'Get Free Marketing & More Customers with Infinity Club – No Catch';
        } else if (templateType === 'corporate_christmas_gift') {
          emailSubject = 'A Christmas gift with real local power';
        }
      } catch (error) {
        console.error(`Failed to load template: ${error.message}`);
        // Fall back to provided content
      }
    }

    // Send emails
    for (const lead of leads) {
      if (!lead.email) {
        failedCount++;
        continue;
      }

      // Replace variables in content - use {name} format
      const personalizedContent = this.emailService.replaceVariables(
        emailContent,
        {
          name: lead.name,
          firstName: lead.name.split(' ')[0],
          companyName: lead.name,
          yourName: 'Infinity Club Team',
        },
      );

      const personalizedSubject = this.emailService.replaceVariables(
        emailSubject,
        {
          name: lead.name,
          firstName: lead.name.split(' ')[0],
          companyName: lead.name,
        },
      );

      // Send email with tracking
      const success = await this.emailService.sendEmail(
        lead.email,
        personalizedSubject,
        personalizedContent,
        campaign.id,
        templateType || 'custom',
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
        metadata: success
          ? { template_type: templateType || 'custom' }
          : { error: 'Failed to send email', template_type: templateType || 'custom' },
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
