import { Controller, Post, Body } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('manual')
  async createManualLead(
    @Body()
    body: {
      name: string;
      business_type: string;
      city: string;
      website?: string;
      phone?: string;
      email?: string;
    },
  ) {
    const lead = await this.leadsService.createManualLead(body);

    return {
      success: true,
      lead,
    };
  }
}
