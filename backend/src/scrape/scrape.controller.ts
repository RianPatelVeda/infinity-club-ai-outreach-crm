import { Controller, Post, Body } from '@nestjs/common';
import { ScrapeService } from './scrape.service';

@Controller('scrape')
export class ScrapeController {
  constructor(private readonly scrapeService: ScrapeService) {}

  @Post('gmb')
  async scrapeGoogleMyBusiness(
    @Body() body: { businessType: string; city: string; limit?: number },
  ) {
    const { businessType, city, limit = 100 } = body;

    const results = await this.scrapeService.scrapeGMB(
      businessType,
      city,
      limit,
    );

    return {
      success: true,
      count: results.length,
      leads: results,
    };
  }
}
