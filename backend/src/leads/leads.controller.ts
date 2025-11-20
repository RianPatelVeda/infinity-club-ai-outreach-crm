import { Controller, Post, Put, Delete, Body, Param } from '@nestjs/common';
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

  @Put(':id')
  async updateLead(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      business_type?: string;
      city?: string;
      website?: string;
      phone?: string;
      email?: string;
      notes?: string;
    },
  ) {
    const lead = await this.leadsService.updateLead(id, body);

    return {
      success: true,
      lead,
    };
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string) {
    await this.leadsService.deleteLead(id);

    return {
      success: true,
      message: 'Lead deleted successfully',
    };
  }
}
