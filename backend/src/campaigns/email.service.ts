import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'noreply@infinityclub.com';

    try {
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        html,
      });

      console.log(`✅ Email sent to ${to}`);
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
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }
}
