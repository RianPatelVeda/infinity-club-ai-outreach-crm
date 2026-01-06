import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { FirebaseService } from '../common/firebase.service';
import { EmailService } from './email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CampaignsService {
  constructor(
    private supabaseService: SupabaseService,
    private firebaseService: FirebaseService,
    private emailService: EmailService,
  ) {}

  private loadTemplateFromFile(templateName: string): string {
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

  private async loadTemplate(
    templateSlug: string,
  ): Promise<{ html: string; subject: string } | null> {
    // Try to load from Firestore first
    const firestoreTemplate =
      await this.firebaseService.getTemplateBySlug(templateSlug);

    if (firestoreTemplate) {
      console.log(`📧 Loaded template "${templateSlug}" from Firestore`);
      return {
        html: firestoreTemplate.html,
        subject: firestoreTemplate.subject,
      };
    }

    // Fall back to local file
    console.log(
      `📁 Template "${templateSlug}" not in Firestore, trying local file...`,
    );
    try {
      const html = this.loadTemplateFromFile(templateSlug);
      // Use hardcoded subjects for legacy templates
      let subject = 'Infinity Club';
      if (templateSlug === 'partner_acquisition_email') {
        subject =
          'Get Free Marketing & More Customers with Infinity Club – No Catch';
      } else if (templateSlug === 'corporate_christmas_gift') {
        subject = 'A Christmas gift with real local power';
      }
      return { html, subject };
    } catch (error) {
      console.error(`Failed to load template from file: ${error.message}`);
      return null;
    }
  }

  async getAvailableTemplates() {
    // Try to get templates from Firestore
    console.log('📋 Fetching available templates...');
    console.log('  - Firestore initialized:', this.firebaseService.isInitialized());

    const templates = await this.firebaseService.getOutreachTemplates();
    console.log('  - Templates from Firestore:', templates.length);

    if (templates.length > 0) {
      console.log('  - Using Firestore templates:', templates.map(t => t.slug).join(', '));
      return templates.map((t) => ({
        slug: t.slug,
        name: t.name,
        subject: t.subject,
        category: t.category,
      }));
    }

    // Fall back to hardcoded list
    console.log('  - Falling back to hardcoded templates');
    return [
      {
        slug: 'partner_acquisition_email',
        name: 'Partner Acquisition',
        subject:
          'Get Free Marketing & More Customers with Infinity Club – No Catch',
        category: 'crm_outreach',
      },
      {
        slug: 'corporate_christmas_gift',
        name: 'Corporate Christmas Gift',
        subject: 'A Christmas gift with real local power',
        category: 'crm_outreach',
      },
    ];
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
      const template = await this.loadTemplate(templateType);
      if (template) {
        emailContent = template.html;
        emailSubject = template.subject;
      } else {
        console.warn(
          `Template "${templateType}" not found, using provided content`,
        );
      }
    }

    // Send emails
    for (const lead of leads) {
      if (!lead.email) {
        failedCount++;
        continue;
      }

      // Build placeholder variables - supports both legacy CRM and Website Admin Portal formats
      const placeholderVariables: Record<string, string> = {
        // Standard CRM variables (legacy format)
        name: lead.name || '',
        firstName: lead.name?.split(' ')[0] || '',
        companyName: lead.name || '',
        yourName: 'Infinity Club Team',

        // Website Admin Portal placeholders (partner category)
        business_name: lead.name || '',
        contact_first_name: lead.name?.split(' ')[0] || '',
        contact_name: lead.name || '',
        contact_email: lead.email || '',

        // System placeholders
        current_year: new Date().getFullYear().toString(),
        company_name: 'Infinity Club',
        support_email: 'info@infinityclub.com',
      };

      // Replace variables in content
      const personalizedContent = this.emailService.replaceVariables(
        emailContent,
        placeholderVariables,
      );

      const personalizedSubject = this.emailService.replaceVariables(
        emailSubject,
        placeholderVariables,
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
          : {
              error: 'Failed to send email',
              template_type: templateType || 'custom',
            },
      });

      if (success) {
        sentCount++;
        // Update lead status
        await supabase
          .from('leads')
          .update({ status: 'contacted' })
          .eq('id', lead.id);

        // Move lead to appropriate kanban stage based on template type
        if (templateType) {
          let stageName = '';
          if (templateType === 'corporate_christmas_gift') {
            stageName = 'Contacted - Christmas';
          } else if (templateType === 'partner_acquisition_email') {
            stageName = 'Contacted - Partner';
          }

          if (stageName) {
            // Get the stage ID
            const { data: stage } = await supabase
              .from('kanban_stages')
              .select('id')
              .eq('name', stageName)
              .single();

            if (stage) {
              // Update lead's kanban stage
              await supabase
                .from('lead_kanban')
                .update({ stage_id: stage.id })
                .eq('lead_id', lead.id);
            }
          }
        }
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
