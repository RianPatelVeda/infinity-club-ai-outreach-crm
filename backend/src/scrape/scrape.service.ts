import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../common/supabase.service';
import axios from 'axios';

export interface ScrapedLead {
  name: string;
  business_type: string;
  city: string;
  website?: string;
  phone?: string;
  email?: string;
  gmb_id?: string;
}

@Injectable()
export class ScrapeService {
  private apiKey: string;
  private apiUrl = 'https://api.app.outscraper.com/maps/search-v3';

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('OUTSCRAPER_API_KEY');
  }

  async scrapeGMB(
    businessType: string,
    city: string,
    limit: number = 100,
  ): Promise<ScrapedLead[]> {
    if (!this.apiKey) {
      throw new Error('Outscraper API key not configured. Please add OUTSCRAPER_API_KEY to your .env file');
    }

    try {
      console.log(`🔍 Searching Google Maps: ${businessType} in ${city}`);
      console.log(`🔑 Using Outscraper REST API v3 with limit: ${limit}`);

      // Build query parameters for GET request (v3 uses GET with query params)
      const params = new URLSearchParams({
        query: `${businessType}, ${city}, UK`,
        limit: limit.toString(),
        language: 'en',
        region: 'GB',
        enrichment: 'domains_service', // Emails & Contacts Scraper
        async: 'false', // Get immediate results
      });

      // Call Outscraper REST API v3
      const response = await axios.get(
        `${this.apiUrl}?${params.toString()}`,
        {
          headers: {
            'X-API-KEY': this.apiKey,
          },
          timeout: 180000, // 3 minute timeout for enrichment
        }
      );

      console.log(`📊 Outscraper API response status:`, response.status);
      console.log(`📊 Response structure:`, {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
      });

      // Outscraper v3 returns data directly in response.data.data array
      const businesses = response.data?.data?.[0] || [];
      console.log(`✅ Found ${businesses.length} businesses from Outscraper`);

      if (businesses.length > 0) {
        console.log(`📝 Sample business (first result):`);
        console.log(JSON.stringify(businesses[0], null, 2));
      }

      // Format and save leads
      const leads: ScrapedLead[] = [];
      const supabase = this.supabaseService.getClient();

      // Ensure kanban stages exist (auto-create if missing)
      const { data: existingStages } = await supabase
        .from('kanban_stages')
        .select('id')
        .limit(1);

      if (!existingStages || existingStages.length === 0) {
        console.log('📋 Creating default kanban stages...');
        await supabase.from('kanban_stages').insert([
          { name: 'First Contact', position: 1, color: '#3B82F6' },
          { name: 'Follow-up', position: 2, color: '#F59E0B' },
          { name: 'Negotiation', position: 3, color: '#8B5CF6' },
          { name: 'Potential Partner', position: 4, color: '#10B981' },
          { name: 'Confirmed Partner', position: 5, color: '#059669' },
        ]);
        console.log('✅ Kanban stages created');
      }

      // Create scrape history record
      const { data: scrapeHistory, error: historyError } = await supabase
        .from('scrape_history')
        .insert({
          business_type: businessType,
          city: city,
          results_count: businesses.length,
        })
        .select()
        .single();

      if (historyError) {
        console.error('Failed to create scrape history:', historyError);
      }

      for (const business of businesses) {
        // Skip if no name
        if (!business.name) {
          console.log('⏭️  Skipping business without name');
          continue;
        }

        // Check for duplicates - use business name as deduplication key
        const { data: existing } = await supabase
          .from('leads')
          .select('id')
          .eq('name', business.name)
          .maybeSingle();

        if (existing) {
          console.log(`⏭️  Skipping duplicate: ${business.name}`);
          continue;
        }

        // Extract contact info from Outscraper response
        // Outscraper returns emails as email_1, email_2, email_3
        let email = null;
        if (business.email_1) {
          email = business.email_1;
        } else if (business.email_2) {
          email = business.email_2;
        } else if (business.email_3) {
          email = business.email_3;
        } else if (business.emails && Array.isArray(business.emails) && business.emails.length > 0) {
          email = business.emails[0];
        } else if (business.email) {
          email = business.email;
        }

        // Outscraper returns phones as phone_1, phone_2, phone_3, or just phone
        const phone = business.phone || business.phone_1 || business.phone_2 || null;
        const website = business.site || business.website || business.domain || null;

        // Log what we found for debugging
        console.log(`📧 ${business.name}: email=${email}, phone=${phone}, website=${website}`);

        // Extract city from address
        const fullAddress = business.full_address || business.address || '';
        const cityFromAddress = city; // Use the search city as default

        // Create lead
        const leadData: any = {
          name: business.name,
          business_type: businessType,
          city: cityFromAddress,
          website: website,
          phone: phone,
          email: email,
          status: 'new',
          source: 'scraped',
          enrichment_status: {
            phone_verified: !!phone,
            email_verified: !!email,
            enrichment_used: !!(email || phone), // Enrichment was used if we got contact info
          },
        };

        // Insert lead
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert(leadData)
          .select()
          .single();

        if (leadError) {
          console.error('Failed to insert lead:', leadError);
          continue;
        }

        console.log(`✅ Added lead: ${business.name}`);

        // Add to kanban (first contact stage)
        const { data: firstStage } = await supabase
          .from('kanban_stages')
          .select('id')
          .eq('name', 'First Contact')
          .maybeSingle();

        if (firstStage) {
          await supabase.from('lead_kanban').insert({
            lead_id: newLead.id,
            stage_id: firstStage.id,
            position: 0,
          });
        }

        leads.push(leadData);
      }

      console.log(`🎉 Successfully added ${leads.length} new leads to database`);
      return leads;
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape Google Maps: ${error.message}`);
    }
  }
}
