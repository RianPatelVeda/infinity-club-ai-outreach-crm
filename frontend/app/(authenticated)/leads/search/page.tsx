'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Table as TableIcon, Grid, Filter, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { UK_CITIES, BUSINESS_CATEGORIES } from '@/lib/uk-locations';

interface Lead {
  id: string;
  name: string;
  business_type: string;
  city: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  enrichment_status: any;
  date_scraped: string;
}

type StatusFilter = 'All' | 'Enriched' | 'Contact Missing' | 'New';

export default function LeadSearchPage() {
  const [businessType, setBusinessType] = useState('');
  const [city, setCity] = useState('');
  const [businessSearchTerm, setBusinessSearchTerm] = useState('');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [currentPostcode, setCurrentPostcode] = useState('');
  const [totalPostcodes, setTotalPostcodes] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualLead, setManualLead] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    businessType: '',
    city: '',
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowBusinessDropdown(false);
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('date_scraped', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLeadSubmit = async () => {
    if (!manualLead.name.trim()) {
      toast.error('Business name is required');
      return;
    }

    try {
      const response = await api.post('/leads/manual', {
        name: manualLead.name,
        email: manualLead.email || null,
        phone: manualLead.phone || null,
        website: manualLead.website || null,
        business_type: manualLead.businessType || 'Unknown',
        city: manualLead.city || 'Unknown',
      });

      toast.success('Lead added successfully!');
      setShowManualEntryModal(false);
      setManualLead({
        name: '',
        email: '',
        phone: '',
        website: '',
        businessType: '',
        city: '',
      });
      await fetchLeads();
    } catch (error: any) {
      console.error('Manual lead error:', error);
      toast.error(error.response?.data?.message || 'Failed to add lead');
    }
  };

  const handleScrape = async () => {
    if (!businessType || !city) {
      toast.error('Please select both business category and city');
      return;
    }

    setScraping(true);
    setScrapeProgress(0);
    setScrapeStatus('Initializing Outscraper API...');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScrapeProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 3000);

      setScrapeStatus(`Searching ${businessType} in ${city}...`);

      const response = await api.post('/scrape/gmb', {
        businessType,
        city,
        limit: 100, // Get up to 100 leads per city
      });

      clearInterval(progressInterval);
      setScrapeProgress(100);
      setScrapeStatus(`Successfully found ${response.data.count} businesses!`);

      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success(`Successfully scraped ${response.data.count} leads from ${city}!`);
      await fetchLeads();

      // Clear inputs
      setBusinessType('');
      setCity('');
    } catch (error: any) {
      console.error('Scraping error:', error);
      setScrapeStatus('Scraping failed');
      toast.error(error.response?.data?.message || 'Scraping failed. Please try again.');
    } finally {
      setScraping(false);
      setScrapeProgress(0);
      setScrapeStatus('');
      setCurrentPostcode('');
      setTotalPostcodes(0);
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
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.size === 0) {
      toast.error('Please select leads to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} lead(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete each selected lead
      const deletePromises = Array.from(selectedLeads).map(leadId =>
        api.delete(`/leads/${leadId}`)
      );

      await Promise.all(deletePromises);

      toast.success(`Successfully deleted ${selectedLeads.size} lead(s)`);
      setSelectedLeads(new Set());
      await fetchLeads();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete leads');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter === 'All') return true;

    const statusLower = String(lead.status || '').trim().toLowerCase();
    const hasEnrichment =
      !!lead.enrichment_status?.email_verified ||
      !!lead.enrichment_status?.phone_verified ||
      !!lead.enrichment_status?.enrichment_used;
    const isContactMissing =
      statusLower === 'contact-missing' || (!lead.email && !lead.phone);
    const isNewStatus =
      statusLower === 'new' ||
      statusLower === 'not_contacted' ||
      statusLower === 'not contacted' ||
      statusLower === '';

    if (statusFilter === 'Enriched') {
      return hasEnrichment || statusLower === 'enriched';
    }

    if (statusFilter === 'Contact Missing') {
      return isContactMissing;
    }

    if (statusFilter === 'New') {
      return isNewStatus;
    }

    return true;
  });

  // Pagination derived data
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const pageStart = (clampedPage - 1) * pageSize;
  const pagedLeads = filteredLeads.slice(pageStart, pageStart + pageSize);
  const pageNumbers: (number | '...')[] = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [1, 2, 3, '...', totalPages - 2, totalPages - 1, totalPages];
  })();

  const getStatusBadge = (lead: Lead) => {
    const badges = [];
    const statusLabel = (lead.status && lead.status.trim()) ? lead.status : 'New';
    const statusLower = statusLabel.toLowerCase();

    const statusClassMap: Record<string, string> = {
      new: 'badge-info',
      enriched: 'badge-aqua',
      contacted: 'badge-warning',
      replied: 'badge-success',
      'in-progress': 'badge-success',
      'contact-missing': 'badge-warning',
    };

    badges.push(
      <span key="status" className={`badge ${statusClassMap[statusLower] || 'badge-info'}`}>
        {statusLabel}
      </span>
    );

    if (lead.enrichment_status?.phone_verified) {
      badges.push(<span key="phone" className="badge badge-success">Phone Verified</span>);
    }
    if (lead.enrichment_status?.email_verified) {
      badges.push(<span key="email" className="badge badge-aqua">Email Verified</span>);
    }
    if (lead.enrichment_status?.enrichment_used) {
      badges.push(<span key="enriched" className="badge badge-info">Enrichment Used</span>);
    }
    if (!lead.email && !lead.phone) {
      badges.push(<span key="missing" className="badge badge-warning">Contact Missing</span>);
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  // Filter categories based on search term
  const filteredCategories = BUSINESS_CATEGORIES.filter(category =>
    category.toLowerCase().includes(businessSearchTerm.toLowerCase())
  );

  // Filter cities based on search term
  const filteredCities = UK_CITIES.filter(ukCity =>
    ukCity.name.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  return (
    <div>
      <Header
        title="Lead Search & Scrape"
        subtitle="Find and enrich new partner leads for your outreach campaigns"
      />

      <div className="p-8">
        {/* Scrape Form */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Business Category - Searchable Dropdown */}
            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category
              </label>
              <input
                type="text"
                value={businessSearchTerm || businessType}
                onChange={(e) => {
                  setBusinessSearchTerm(e.target.value);
                  setShowBusinessDropdown(true);
                }}
                onFocus={() => setShowBusinessDropdown(true)}
                placeholder="Type to search categories..."
                className="input"
                disabled={scraping}
              />
              {showBusinessDropdown && !scraping && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <div
                        key={category}
                        className="px-4 py-2 hover:bg-aqua/10 cursor-pointer"
                        onClick={() => {
                          setBusinessType(category);
                          setBusinessSearchTerm(category);
                          setShowBusinessDropdown(false);
                        }}
                      >
                        {category}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No categories found</div>
                  )}
                </div>
              )}
            </div>

            {/* UK City - Searchable Dropdown */}
            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UK City
              </label>
              <input
                type="text"
                value={citySearchTerm || city}
                onChange={(e) => {
                  setCitySearchTerm(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Type to search cities..."
                className="input"
                disabled={scraping}
              />
              {showCityDropdown && !scraping && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((ukCity) => (
                      <div
                        key={ukCity.name}
                        className="px-4 py-2 hover:bg-aqua/10 cursor-pointer"
                        onClick={() => {
                          setCity(ukCity.name);
                          setCitySearchTerm(ukCity.name);
                          setShowCityDropdown(false);
                        }}
                      >
                        {ukCity.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No cities found</div>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-1 flex items-end">
              <button
                onClick={handleScrape}
                disabled={scraping}
                className="btn btn-primary w-full py-3 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                <span>{scraping ? 'Scraping...' : 'Scrape Leads'}</span>
              </button>
            </div>
          </div>

          {scraping && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{scrapeStatus}</span>
                <span className="text-aqua font-bold">{scrapeProgress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-aqua to-blue-500 h-full rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${scrapeProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-4 h-4 border-2 border-aqua border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">
                  Searching <strong>{businessType}</strong> in <strong>{city}</strong> and enriching contact data...
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Intelligent Search:</strong> Finding up to 100 businesses with verified emails and phone numbers. This typically takes 30-60 seconds.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>All</option>
              <option>Enriched</option>
              <option>Contact Missing</option>
              <option>New</option>
            </select>
            <button
              onClick={() => setShowManualEntryModal(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <span>+ Add New Lead</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-aqua' : 'bg-gray-100'}`}
            >
              <TableIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-aqua' : 'bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500">Loading leads...</p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="card">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No leads found. Start by scraping businesses above.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-aqua rounded"
                          />
                        </th>
                        <th>NAME</th>
                        <th>BUSINESS TYPE</th>
                        <th>CITY</th>
                        <th>WEBSITE</th>
                        <th>PHONE</th>
                        <th>EMAIL</th>
                        <th>STATUS</th>
                        <th>DATE SCRAPED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedLeads.map((lead) => (
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
                          <td>
                            {lead.website ? (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-aqua hover:underline"
                              >
                                {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>{lead.phone || '-'}</td>
                          <td>{lead.email || '-'}</td>
                          <td>{getStatusBadge(lead)}</td>
                          <td className="text-sm text-gray-500">
                            {format(new Date(lead.date_scraped), 'yyyy-MM-dd')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {pageStart + 1}-{Math.min(pageStart + pageSize, filteredLeads.length)} of {filteredLeads.length} results
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={clampedPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {pageNumbers.map((page, idx) =>
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg border ${
                            page === clampedPage
                              ? 'bg-aqua text-white border-aqua'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={clampedPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedLeads.map((lead) => (
              <div key={lead.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg">{lead.name}</h3>
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id)}
                    onChange={() => toggleLeadSelection(lead.id)}
                    className="w-4 h-4 text-aqua rounded"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">{lead.business_type}</p>
                <p className="text-sm text-gray-500 mb-4">{lead.city}</p>

                <div className="space-y-2 mb-4 text-sm">
                  {lead.email && (
                    <p className="truncate">
                      <span className="text-gray-500">Email:</span>{' '}
                      <a href={`mailto:${lead.email}`} className="text-aqua hover:underline">
                        {lead.email}
                      </a>
                    </p>
                  )}
                  {lead.phone && (
                    <p><span className="text-gray-500">Phone:</span> {lead.phone}</p>
                  )}
                </div>

                {getStatusBadge(lead)}
              </div>
            ))}
          </div>
        )}

        {selectedLeads.size > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-xl px-6 py-4 flex items-center space-x-4">
            <p className="text-sm font-medium">{selectedLeads.size} leads selected</p>
            <button className="btn btn-primary">Add to Campaign</button>
            <button className="btn btn-secondary">Export</button>
            <button
              onClick={handleDeleteSelected}
              className="btn bg-red-500 hover:bg-red-600 text-white flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Manual Lead Entry Modal */}
        {showManualEntryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Lead Manually</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={manualLead.name}
                    onChange={(e) => setManualLead({...manualLead, name: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., The Best Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={manualLead.email}
                    onChange={(e) => setManualLead({...manualLead, email: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., contact@business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={manualLead.phone}
                    onChange={(e) => setManualLead({...manualLead, phone: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., +44 20 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={manualLead.website}
                    onChange={(e) => setManualLead({...manualLead, website: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., https://business.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={manualLead.businessType}
                    onChange={(e) => setManualLead({...manualLead, businessType: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., Restaurant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={manualLead.city}
                    onChange={(e) => setManualLead({...manualLead, city: e.target.value})}
                    className="input w-full"
                    placeholder="e.g., London"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowManualEntryModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualLeadSubmit}
                  className="btn btn-primary flex-1"
                >
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
