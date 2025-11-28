import { Controller, Post, Body, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('sendgrid')
  async handleSendGridWebhook(
    @Body() events: any[],
    @Headers('x-twilio-email-event-webhook-signature') signature: string,
  ) {
    console.log('📧 Received SendGrid webhook events:', events.length);

    // Process each event
    for (const event of events) {
      await this.webhooksService.processSendGridEvent(event);
    }

    return { success: true, processed: events.length };
  }
}
