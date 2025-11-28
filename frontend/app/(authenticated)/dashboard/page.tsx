'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { ArrowUp, ArrowDown, Plus, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Stats {
  newLeads: number;
  newLeadsChange: number;
  enrichedLeads: number;
  enrichedLeadsChange: number;
  engaged: number;
  engagedChange: number;
  meetingsBooked: number;
  meetingsBookedChange: number;
}

interface Lead {
  id: string;
  name: string;
  business_type: string;
  city: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  source: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    newLeads: 0,
    newLeadsChange: 0,
    enrichedLeads: 0,
    enrichedLeadsChange: 0,
    engaged: 0,
    engagedChange: 0,
    meetingsBooked: 0,
    meetingsBookedChange: 0,
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const fetchDashboardData = async () => {
    try {
      // Get date ranges
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Fetch recent leads for display
      const { data: allLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (leadsError) throw leadsError;
      setLeads(allLeads || []);

      // Fetch current week stats
      const { data: currentWeekLeads } = await supabase
        .from('leads')
        .select('status, enrichment_status, created_at')
        .gte('created_at', oneWeekAgo.toISOString());

      // Fetch previous week stats
      const { data: previousWeekLeads } = await supabase
        .from('leads')
        .select('status, enrichment_status, created_at')
        .gte('created_at', twoWeeksAgo.toISOString())
        .lt('created_at', oneWeekAgo.toISOString());

      // Calculate current stats
      const currentNew = currentWeekLeads?.filter(l => l.status === 'new').length || 0;
      const currentEnriched = currentWeekLeads?.filter(l =>
        l.enrichment_status?.email_verified || l.enrichment_status?.phone_verified
      ).length || 0;
      const currentEngaged = currentWeekLeads?.filter(l =>
        ['contacted', 'replied', 'in-progress'].includes(l.status)
      ).length || 0;

      // Calculate previous stats
      const previousNew = previousWeekLeads?.filter(l => l.status === 'new').length || 0;
      const previousEnriched = previousWeekLeads?.filter(l =>
        l.enrichment_status?.email_verified || l.enrichment_status?.phone_verified
      ).length || 0;
      const previousEngaged = previousWeekLeads?.filter(l =>
        ['contacted', 'replied', 'in-progress'].includes(l.status)
      ).length || 0;

      // Count meetings from kanban (Potential Partner + Confirmed Partner stages)
      // First get the stage IDs for partner stages
      const { data: partnerStages } = await supabase
        .from('kanban_stages')
        .select('id')
        .in('name', ['Potential Partner', 'Confirmed Partner']);

      const partnerStageIds = partnerStages?.map(s => s.id) || [];

      let currentMeetings = 0;
      let previousMeetings = 0;

      if (partnerStageIds.length > 0) {
        const { data: kanbanLeads } = await supabase
          .from('lead_kanban')
          .select('stage_id, moved_at')
          .in('stage_id', partnerStageIds)
          .gte('moved_at', oneWeekAgo.toISOString());

        const { data: previousKanbanLeads } = await supabase
          .from('lead_kanban')
          .select('stage_id, moved_at')
          .in('stage_id', partnerStageIds)
          .gte('moved_at', twoWeeksAgo.toISOString())
          .lt('moved_at', oneWeekAgo.toISOString());

        currentMeetings = kanbanLeads?.length || 0;
        previousMeetings = previousKanbanLeads?.length || 0;
      }

      setStats({
        newLeads: currentNew,
        newLeadsChange: calculatePercentageChange(currentNew, previousNew),
        enrichedLeads: currentEnriched,
        enrichedLeadsChange: calculatePercentageChange(currentEnriched, previousEnriched),
        engaged: currentEngaged,
        engagedChange: calculatePercentageChange(currentEngaged, previousEngaged),
        meetingsBooked: currentMeetings,
        meetingsBookedChange: calculatePercentageChange(currentMeetings, previousMeetings),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      new: 'badge-info',
      enriched: 'badge-aqua',
      contacted: 'badge-warning',
      replied: 'badge-success',
      'contact-missing': 'badge-error',
    };

    return (
      <span className={`badge ${statusMap[status] || 'badge-info'}`}>
        {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Overview of your partner outreach activities"
      />

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">NEW LEADS</p>
              {stats.newLeadsChange !== 0 && (
                <span className={`flex items-center text-xs ${stats.newLeadsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.newLeadsChange > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.newLeadsChange)}%
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.newLeads.toLocaleString()}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">ENRICHED LEADS</p>
              {stats.enrichedLeadsChange !== 0 && (
                <span className={`flex items-center text-xs ${stats.enrichedLeadsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.enrichedLeadsChange > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.enrichedLeadsChange)}%
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.enrichedLeads.toLocaleString()}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">ENGAGED</p>
              {stats.engagedChange !== 0 && (
                <span className={`flex items-center text-xs ${stats.engagedChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.engagedChange > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.engagedChange)}%
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.engaged}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-600">PARTNERS GAINED</p>
              {stats.meetingsBookedChange !== 0 && (
                <span className={`flex items-center text-xs ${stats.meetingsBookedChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.meetingsBookedChange > 0 ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(stats.meetingsBookedChange)}%
                </span>
              )}
            </div>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.meetingsBooked}</h3>
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">MY LEADS</h2>
            <div className="flex items-center space-x-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Leads</option>
                <option>New</option>
                <option>Enriched</option>
                <option>Contacted</option>
              </select>
              <Link href="/leads/search" className="btn btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>NEW LEAD</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No leads found. Start by scraping or adding leads manually.</p>
              <Link href="/leads/search" className="btn btn-primary mt-4">
                Add First Lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>COMPANY</th>
                    <th>CONTACT</th>
                    <th>STATUS</th>
                    <th>LAST ACTIVITY</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.website || 'No website'}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm">{lead.email || '-'}</p>
                          <p className="text-xs text-gray-500">{lead.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td>{getStatusBadge(lead.status)}</td>
                      <td className="text-sm text-gray-600">
                        {lead.source === 'manual' ? 'Manual Entry' : `Email Sent: ${format(new Date(lead.created_at), 'MMM d')}`}
                      </td>
                      <td>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500 text-center">
            Showing 1 to {Math.min(5, leads.length)} of {stats.newLeads + stats.enrichedLeads + stats.engaged} results
          </div>
        </div>
      </div>
    </div>
  );
}
