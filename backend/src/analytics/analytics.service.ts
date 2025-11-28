import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class AnalyticsService {
  constructor(private supabaseService: SupabaseService) {}

  async getDashboardMetrics() {
    const supabase = this.supabaseService.getClient();

    // Get total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Get total campaigns
    const { count: totalCampaigns } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    // Get email stats from outreach_history
    const { data: emailStats } = await supabase
      .from('outreach_history')
      .select('opened, clicked, bounced, delivered')
      .eq('type', 'email');

    const totalEmails = emailStats?.length || 0;
    const openedEmails = emailStats?.filter((e) => e.opened).length || 0;
    const clickedEmails = emailStats?.filter((e) => e.clicked).length || 0;
    const bouncedEmails = emailStats?.filter((e) => e.bounced).length || 0;
    const deliveredEmails = emailStats?.filter((e) => e.delivered).length || 0;

    const openRate = totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;
    const clickRate = totalEmails > 0 ? (clickedEmails / totalEmails) * 100 : 0;
    const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails) * 100 : 0;
    const deliveryRate = totalEmails > 0 ? (deliveredEmails / totalEmails) * 100 : 0;

    // Get leads by stage
    const { data: leadsByStage } = await supabase
      .from('lead_kanban')
      .select('stage_id, kanban_stages(name)')
      .order('stage_id');

    const stageCounts: Record<string, number> = {};
    leadsByStage?.forEach((item: any) => {
      const stageName = item.kanban_stages?.name || 'Unknown';
      stageCounts[stageName] = (stageCounts[stageName] || 0) + 1;
    });

    return {
      totalLeads: totalLeads || 0,
      totalCampaigns: totalCampaigns || 0,
      totalEmails,
      emailMetrics: {
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        bounceRate: Math.round(bounceRate * 10) / 10,
        deliveryRate: Math.round(deliveryRate * 10) / 10,
        opened: openedEmails,
        clicked: clickedEmails,
        bounced: bouncedEmails,
        delivered: deliveredEmails,
      },
      leadsByStage: stageCounts,
    };
  }

  async getEmailPerformance() {
    const supabase = this.supabaseService.getClient();

    // Get daily email performance for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: emails } = await supabase
      .from('outreach_history')
      .select('created_at, opened, clicked, delivered, bounced')
      .eq('type', 'email')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at');

    // Group by date
    const dailyStats: Record<string, any> = {};

    emails?.forEach((email) => {
      const date = new Date(email.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          sent: 0,
          opened: 0,
          clicked: 0,
          delivered: 0,
          bounced: 0,
        };
      }

      dailyStats[date].sent += 1;
      if (email.opened) dailyStats[date].opened += 1;
      if (email.clicked) dailyStats[date].clicked += 1;
      if (email.delivered) dailyStats[date].delivered += 1;
      if (email.bounced) dailyStats[date].bounced += 1;
    });

    return Object.values(dailyStats);
  }

  async getScrapingStats() {
    const supabase = this.supabaseService.getClient();

    // Get scraping stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: leads } = await supabase
      .from('leads')
      .select('date_scraped, email, phone, business_type, city')
      .gte('date_scraped', thirtyDaysAgo.toISOString())
      .order('date_scraped');

    // Group by date
    const dailyStats: Record<string, any> = {};

    leads?.forEach((lead) => {
      const date = new Date(lead.date_scraped).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          total: 0,
          withEmail: 0,
          withPhone: 0,
        };
      }

      dailyStats[date].total += 1;
      if (lead.email) dailyStats[date].withEmail += 1;
      if (lead.phone) dailyStats[date].withPhone += 1;
    });

    // Get top cities and business types
    const cityCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    leads?.forEach((lead) => {
      cityCounts[lead.city] = (cityCounts[lead.city] || 0) + 1;
      typeCounts[lead.business_type] = (typeCounts[lead.business_type] || 0) + 1;
    });

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));

    const topTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    return {
      dailyStats: Object.values(dailyStats),
      topCities,
      topTypes,
    };
  }
}
