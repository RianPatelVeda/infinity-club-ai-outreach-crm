'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { ArrowUp, ArrowDown, Mail, MousePointerClick, AlertCircle, CheckCircle, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';

interface DashboardMetrics {
  totalLeads: number;
  totalCampaigns: number;
  totalEmails: number;
  emailMetrics: {
    openRate: number;
    clickRate: number;
    bounceRate: number;
    deliveryRate: number;
    opened: number;
    clicked: number;
    bounced: number;
    delivered: number;
  };
  leadsByStage: Record<string, number>;
}

interface EmailPerformance {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  delivered: number;
  bounced: number;
}

interface ScrapingStats {
  dailyStats: Array<{
    date: string;
    total: number;
    withEmail: number;
    withPhone: number;
  }>;
  topCities: Array<{ city: string; count: number }>;
  topTypes: Array<{ type: string; count: number }>;
}

const COLORS = ['#00CED1', '#4169E1', '#32CD32', '#FFD700', '#FF6347', '#9370DB', '#FF69B4', '#FFA500', '#00FA9A', '#DC143C'];

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [emailPerformance, setEmailPerformance] = useState<EmailPerformance[]>([]);
  const [scrapingStats, setScrapingStats] = useState<ScrapingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [metricsRes, performanceRes, scrapingRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/analytics/email-performance'),
        api.get('/analytics/scraping-stats'),
      ]);

      setMetrics(metricsRes.data);
      setEmailPerformance(performanceRes.data);
      setScrapingStats(scrapingRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Analytics" subtitle="Comprehensive metrics and insights" />
        <div className="p-8 text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stageData = metrics?.leadsByStage
    ? Object.entries(metrics.leadsByStage).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div>
      <Header
        title="Analytics"
        subtitle="Comprehensive metrics and insights from email campaigns and scraping operations"
      />

      <div className="p-8">
        {/* Email Performance Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">EMAIL CAMPAIGN METRICS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">OPEN RATE</p>
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{metrics?.emailMetrics.openRate || 0}%</h3>
                <p className="text-sm text-gray-500">{metrics?.emailMetrics.opened || 0} opened</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">CLICK RATE</p>
                <MousePointerClick className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{metrics?.emailMetrics.clickRate || 0}%</h3>
                <p className="text-sm text-gray-500">{metrics?.emailMetrics.clicked || 0} clicked</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">DELIVERY RATE</p>
                <CheckCircle className="w-5 h-5 text-aqua" />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{metrics?.emailMetrics.deliveryRate || 0}%</h3>
                <p className="text-sm text-gray-500">{metrics?.emailMetrics.delivered || 0} delivered</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">BOUNCE RATE</p>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold">{metrics?.emailMetrics.bounceRate || 0}%</h3>
                <p className="text-sm text-gray-500">{metrics?.emailMetrics.bounced || 0} bounced</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Performance Trend */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-6">EMAIL PERFORMANCE TREND (LAST 30 DAYS)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={emailPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#666" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#4169E1" name="Sent" strokeWidth={2} />
              <Line type="monotone" dataKey="delivered" stroke="#00CED1" name="Delivered" strokeWidth={2} />
              <Line type="monotone" dataKey="opened" stroke="#32CD32" name="Opened" strokeWidth={2} />
              <Line type="monotone" dataKey="clicked" stroke="#FFD700" name="Clicked" strokeWidth={2} />
              <Line type="monotone" dataKey="bounced" stroke="#FF6347" name="Bounced" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Scraping Stats and Lead Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Scraping Operations */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">SCRAPING OPERATIONS (LAST 30 DAYS)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scrapingStats?.dailyStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11 }} />
                <YAxis stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="total" fill="#4169E1" name="Total Leads" />
                <Bar dataKey="withEmail" fill="#32CD32" name="With Email" />
                <Bar dataKey="withPhone" fill="#FFD700" name="With Phone" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Pipeline Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">LEAD PIPELINE DISTRIBUTION</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities and Business Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Cities */}
          <div className="card">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-aqua mr-2" />
              <h2 className="text-xl font-bold">TOP CITIES</h2>
            </div>
            <div className="space-y-3">
              {scrapingStats?.topCities.slice(0, 10).map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-600 w-6">{index + 1}</span>
                    <span className="text-sm ml-3">{city.city}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-2 bg-aqua rounded-full"
                        style={{ width: `${(city.count / (scrapingStats.topCities[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{city.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Business Types */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Briefcase className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-bold">TOP BUSINESS TYPES</h2>
            </div>
            <div className="space-y-3">
              {scrapingStats?.topTypes.slice(0, 10).map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <span className="text-sm font-medium text-gray-600 w-6">{index + 1}</span>
                    <span className="text-sm ml-3">{type.type}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(type.count / (scrapingStats.topTypes[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-6">OVERALL SUMMARY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL LEADS</p>
              <h3 className="text-4xl font-bold text-gray-900">{metrics?.totalLeads || 0}</h3>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL CAMPAIGNS</p>
              <h3 className="text-4xl font-bold text-gray-900">{metrics?.totalCampaigns || 0}</h3>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">EMAILS SENT</p>
              <h3 className="text-4xl font-bold text-gray-900">{metrics?.totalEmails || 0}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
