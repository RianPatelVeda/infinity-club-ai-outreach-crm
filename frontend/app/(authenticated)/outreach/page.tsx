'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, Mail, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { EMAIL_TEMPLATES } from '@/lib/emailTemplates';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  business_type: string;
  city: string;
  status: string;
  phone: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
}

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .not('email', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
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

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Are you sure you want to delete "${leadName}"?`)) {
      return;
    }

    try {
      await api.delete(`/leads/${leadId}`);
      toast.success('Lead deleted successfully');
      await fetchLeads();
      // Remove from selection if it was selected
      const newSelection = new Set(selectedLeads);
      newSelection.delete(leadId);
      setSelectedLeads(newSelection);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowEditModal(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await api.put(`/leads/${editingLead.id}`, {
        name: editingLead.name,
        email: editingLead.email,
        phone: editingLead.phone,
        business_type: editingLead.business_type,
        city: editingLead.city,
        website: editingLead.website,
        notes: editingLead.notes,
      });

      toast.success('Lead updated successfully');
      setShowEditModal(false);
      setEditingLead(null);
      await fetchLeads();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update lead');
    }
  };

  const handleSendCampaign = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select at least one lead');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select an email template');
      return;
    }

    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    setSending(true);
    try {
      const response = await api.post('/campaigns/send', {
        leadIds: Array.from(selectedLeads),
        subject: template.subject,
        content: template.html,
        sendNow: true,
        templateType: template.id === 'partner' ? 'partner_acquisition_email' : 'corporate_christmas_gift',
      });

      toast.success(`Campaign sent to ${selectedLeads.size} leads!`);

      setSelectedLeads(new Set());
      setSelectedTemplate('');
      await fetchLeads();
    } catch (error: any) {
      console.error('Campaign send error:', error);
      toast.error(error.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  const selectedTemplateData = EMAIL_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div>
      <Header
        title="Email Outreach"
        subtitle="Select leads and send email campaigns"
      />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Available Leads</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : 'Select leads to send emails'}
                  </p>
                </div>
                <button
                  onClick={fetchLeads}
                  className="btn btn-secondary text-sm"
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No leads with email addresses found</p>
                  <p className="text-sm text-gray-400 mt-2">Add leads from the Lead Search page</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedLeads.size === leads.length && leads.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-aqua rounded"
                          />
                        </th>
                        <th>BUSINESS NAME</th>
                        <th>TYPE</th>
                        <th>CITY</th>
                        <th>EMAIL</th>
                        <th>ADDED</th>
                        <th className="w-24">ACTIONS</th>
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
                          <td>{lead.city}</td>
                          <td className="text-sm text-gray-600">{lead.email}</td>
                          <td className="text-sm text-gray-500">
                            {format(new Date(lead.created_at), 'MMM d, yyyy')}
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditLead(lead)}
                                className="p-1.5 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                                title="Edit lead"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id, lead.name)}
                                className="p-1.5 hover:bg-red-50 rounded text-red-600 transition-colors"
                                title="Delete lead"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Campaign Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Send className="w-5 h-5 mr-2 text-aqua" />
                Send Email Campaign
              </h3>

              <div className="space-y-4">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Email Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a template...</option>
                    {EMAIL_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Template Preview */}
                {selectedTemplateData && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-1">SUBJECT LINE</p>
                    <p className="text-sm font-medium text-gray-900">{selectedTemplateData.subject}</p>
                  </div>
                )}

                {/* Selected Count */}
                {selectedLeads.size > 0 && (
                  <div className="bg-aqua/10 border border-aqua/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Recipients Selected
                      </span>
                      <span className="text-lg font-bold text-aqua">
                        {selectedLeads.size}
                      </span>
                    </div>
                  </div>
                )}

                {/* Send Button */}
                <button
                  onClick={handleSendCampaign}
                  disabled={sending || selectedLeads.size === 0 || !selectedTemplate}
                  className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Campaign</span>
                    </>
                  )}
                </button>

                {selectedLeads.size === 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Select leads from the table to enable sending
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Edit Lead</h2>
            <form onSubmit={handleUpdateLead}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <input
                    type="text"
                    value={editingLead.business_type}
                    onChange={(e) => setEditingLead({ ...editingLead, business_type: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={editingLead.city}
                    onChange={(e) => setEditingLead({ ...editingLead, city: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingLead.email || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editingLead.phone || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editingLead.website || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, website: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editingLead.notes || ''}
                    onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingLead(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
