'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Table as TableIcon,
  Grid,
  Send,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  business_type: string;
  status: string;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
}

interface OutreachHistory {
  id: string;
  lead_id: string;
  type: string;
  status: string;
  subject: string;
  created_at: string;
  metadata: any;
}

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showCampaignPanel, setShowCampaignPanel] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [sendOption, setSendOption] = useState<'now' | 'later'>('now');
  const [outreachHistory, setOutreachHistory] = useState<OutreachHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch leads with email
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .not('email', 'is', null)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      // Fetch email templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('email_templates')
        .select('*');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch outreach history
      const { data: historyData, error: historyError } = await supabase
        .from('outreach_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;
      setOutreachHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailContent(template.content);
    }
  };

  const handleSendCampaign = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select at least one lead');
      return;
    }

    if (!emailSubject || !emailContent) {
      toast.error('Please fill in email subject and content');
      return;
    }

    try {
      const response = await api.post('/campaigns/send', {
        leadIds: Array.from(selectedLeads),
        subject: emailSubject,
        content: emailContent,
        sendNow: sendOption === 'now',
      });

      toast.success(
        `Campaign ${sendOption === 'now' ? 'sent' : 'scheduled'} to ${selectedLeads.size} leads!`
      );

      // Reset form
      setSelectedLeads(new Set());
      setShowCampaignPanel(false);
      setEmailSubject('');
      setEmailContent('');
      setSelectedTemplate('');

      // Refresh data
      await fetchData();
    } catch (error: any) {
      console.error('Campaign send error:', error);
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; className: string; label: string }> = {
      new: { icon: Clock, className: 'badge-info', label: 'New' },
      contacted: { icon: Send, className: 'badge-warning', label: 'Contacted' },
      replied: { icon: CheckCircle, className: 'badge-success', label: 'Replied' },
      'in-progress': { icon: Clock, className: 'badge-info', label: 'In-Progress' },
      partner: { icon: CheckCircle, className: 'badge-success', label: 'Partner' },
      failed: { icon: XCircle, className: 'badge-error', label: 'Failed' },
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.className} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </span>
    );
  };

  const getHistoryIcon = (type: string, status: string) => {
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'sent' || status === 'delivered') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (type === 'email') return <Send className="w-5 h-5 text-blue-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  return (
    <div>
      <Header
        title="Lead Outreach Management"
        subtitle="Manage and execute email outreach to potential partners"
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Leads Table */}
          <div className={`${showCampaignPanel ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Available Leads</h2>
                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Status: All</option>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Replied</option>
                  </select>

                  <button
                    onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                    className="p-2 bg-gray-100 rounded-lg"
                  >
                    {viewMode === 'table' ? <Grid className="w-5 h-5" /> : <TableIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedLeads.size === leads.length && leads.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-aqua rounded"
                          />
                        </th>
                        <th>NAME</th>
                        <th>COMPANY</th>
                        <th>STATUS</th>
                        <th>LAST CONTACT</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedLeads.has(lead.id)}
                              onChange={() => toggleLeadSelection(lead.id)}
                              className="w-4 h-4 text-aqua rounded"
                            />
                          </td>
                          <td className="font-medium">{lead.name}</td>
                          <td>{lead.business_type}</td>
                          <td>{getStatusBadge(lead.status)}</td>
                          <td className="text-sm text-gray-500">
                            {format(new Date(lead.created_at), 'yyyy-MM-dd')}
                          </td>
                          <td>
                            <button className="text-aqua hover:underline text-sm">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Outreach History */}
            <div className="card mt-8">
              <h2 className="text-xl font-bold mb-6">Outreach History</h2>

              <div className="space-y-4">
                {outreachHistory.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getHistoryIcon(item.type, item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Email sent to {leads.find(l => l.id === item.lead_id)?.name || 'Unknown'}
                        </p>
                        <span className="text-sm text-gray-500">
                          {format(new Date(item.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.subject}</p>
                      {item.metadata?.error && (
                        <p className="text-sm text-red-500 mt-1">Reason: {item.metadata.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Panel */}
          {showCampaignPanel && (
            <div className="lg:col-span-1">
              <div className="card sticky top-8">
                <h3 className="text-lg font-bold mb-4">Email Outreach to {selectedLeads.size} Leads</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Template
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="input"
                    >
                      <option value="">Select a Campaign Template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="input"
                      placeholder="Subject line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Content
                    </label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={10}
                      className="input font-mono text-sm"
                      placeholder="Hi {firstName},&#10;&#10;Hope you're having a great week.&#10;&#10;I'm reaching out from Infinity Club to explore potential partnership opportunities with {companyName}..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Variables: {'{firstName}'}, {'{companyName}'}, {'{yourName}'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Scheduling Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={sendOption === 'now'}
                          onChange={() => setSendOption('now')}
                          className="w-4 h-4 text-aqua"
                        />
                        <span className="text-sm">Send Now</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={sendOption === 'later'}
                          onChange={() => setSendOption('later')}
                          className="w-4 h-4 text-aqua"
                        />
                        <span className="text-sm">Schedule for Later</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSendCampaign}
                    className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span>Send Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Action Bar */}
        {selectedLeads.size > 0 && !showCampaignPanel && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-xl px-6 py-4 flex items-center space-x-4">
            <p className="text-sm font-medium">{selectedLeads.size} leads selected</p>
            <button
              onClick={() => setShowCampaignPanel(true)}
              className="btn btn-primary"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
