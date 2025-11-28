import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    campaignId?: string,
    templateType?: string,
  ): Promise<boolean> {
    const fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'noreply@infinityclub.com';

    try {
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        html,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true,
          },
          openTracking: {
            enable: true,
          },
        },
        categories: ['infinity-club-campaign', templateType || 'custom'],
        customArgs: {
          campaign_type: 'outreach',
          sent_from: 'infinity-club-crm',
          campaign_id: campaignId || '',
          template_type: templateType || 'custom',
        },
      });

      console.log(`✅ Email sent to ${to} (Template: ${templateType || 'custom'})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  replaceVariables(
    content: string,
    variables: Record<string, string>,
  ): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      // Support both {name} and [Name] style placeholders (case-insensitive)
      const regex = new RegExp(`[\\[{]${key}[\\]}]`, 'gi');
      result = result.replace(regex, value);
    });
    return result;
  }
}
