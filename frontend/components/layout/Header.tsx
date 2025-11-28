'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Bell, User, MailCheck, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

type NotificationType = 'campaign' | 'lead' | 'reminder' | 'system';
type NotificationStatus = 'success' | 'warning' | 'error' | 'info';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  created_at: string;
  read: boolean;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchResults, setSearchResults] = useState<{
    leads: Array<{ id: string; name: string; email: string | null; status: string }>;
    campaigns: Array<{ id: string; name: string; subject: string }>;
  }>({ leads: [], campaigns: [] });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const hasSearchContent =
    searchTerm.trim().length > 0 ||
    searchResults.leads.length > 0 ||
    searchResults.campaigns.length > 0;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchTerm.trim()) {
      setSearchResults({ leads: [], campaigns: [] });
      return;
    }

    searchTimeout.current = setTimeout(() => {
      runSearch(searchTerm.trim());
    }, 300);
  }, [searchTerm]);

  const loadReadSet = () => {
    if (typeof window === 'undefined') return new Set<string>();
    try {
      const stored = window.localStorage.getItem('notifications.read');
      if (!stored) return new Set<string>();
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return new Set<string>();
      return new Set(parsed as string[]);
    } catch (_e) {
      return new Set<string>();
    }
  };

  const persistReadSet = (readSet: Set<string>) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('notifications.read', JSON.stringify(Array.from(readSet)));
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const readSet = loadReadSet();

      const [outreachRes, leadsRes] = await Promise.all([
        supabase
          .from('outreach_history')
          .select('id, subject, delivered, bounced, opened, clicked, created_at, lead_id')
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from('leads')
          .select('id, name, status, email, phone, created_at')
          .order('created_at', { ascending: false })
          .limit(12),
      ]);

      const outreach = outreachRes.data || [];
      const leads = leadsRes.data || [];

      const items: NotificationItem[] = [];

      outreach.forEach((item: any) => {
        const status: NotificationStatus = item.bounced
          ? 'error'
          : item.delivered
            ? 'success'
            : 'info';
        const action = item.bounced ? 'bounced' : item.clicked ? 'was clicked' : item.delivered ? 'delivered' : 'sent';
        items.push({
          id: `email-${item.id}`,
          title: item.subject || 'Campaign email',
          message: `Email ${action}${item.lead_id ? ` (Lead ${item.lead_id})` : ''}`,
          type: 'campaign',
          status,
          created_at: item.created_at,
          read: readSet.has(`email-${item.id}`),
        });
      });

      leads.forEach((lead: any) => {
        const statusLower = String(lead.status || '').toLowerCase();
        const status: NotificationStatus =
          statusLower === 'contacted' || statusLower === 'replied' ? 'warning' : 'info';

        items.push({
          id: `lead-${lead.id}`,
          title: lead.name || 'New Lead',
          message: statusLower
            ? `Status updated to ${statusLower}`
            : 'New lead added',
          type: 'lead',
          status,
          created_at: lead.created_at || new Date().toISOString(),
          read: readSet.has(`lead-${lead.id}`),
        });

        // Reminder: follow-up after 3 days if contacted/replied
        if (statusLower === 'contacted' || statusLower === 'replied') {
          const createdDate = lead.created_at ? new Date(lead.created_at) : new Date();
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          if (createdDate < threeDaysAgo) {
            items.push({
              id: `reminder-${lead.id}`,
              title: `Follow up: ${lead.name}`,
              message: 'Contacted 3+ days ago. Send a follow-up.',
              type: 'reminder',
              status: 'warning',
              created_at: lead.created_at || new Date().toISOString(),
              read: readSet.has(`reminder-${lead.id}`),
            });
          }
        }
      });

      // System issue: any bounced emails
      outreach
        .filter((item: any) => item.bounced)
        .forEach((item: any) => {
          items.push({
            id: `system-${item.id}`,
            title: 'Email delivery issue',
            message: `Email bounced${item.lead_id ? ` for lead ${item.lead_id}` : ''}.`,
            type: 'system',
            status: 'error',
            created_at: item.created_at,
            read: readSet.has(`system-${item.id}`),
          });
        });

      // Sort by time desc and cap
      const sorted = items
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 30);

      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const runSearch = async (term: string) => {
    setSearching(true);
    try {
      const like = `%${term}%`;
      const [leadsRes, campaignsRes] = await Promise.all([
        supabase
          .from('leads')
          .select('id, name, email, status')
          .or(`name.ilike.${like},email.ilike.${like}`)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('campaigns')
          .select('id, name, subject')
          .or(`name.ilike.${like},subject.ilike.${like}`)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      setSearchResults({
        leads: leadsRes.data || [],
        campaigns: campaignsRes.data || [],
      });
      setSearchOpen(true);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setSearching(false);
    }
  };

  const markAllRead = () => {
    const readSet = loadReadSet();
    notifications.forEach((n) => readSet.add(n.id));
    persistReadSet(readSet);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    const readSet = loadReadSet();
    readSet.add(id);
    persistReadSet(readSet);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderIcon = (type: NotificationType, status: NotificationStatus) => {
    const base = 'w-4 h-4';
    if (type === 'campaign') return <MailCheck className={`${base} text-aqua`} />;
    if (type === 'lead') return <Sparkles className={`${base} text-blue-500`} />;
    if (type === 'reminder') return <Clock className={`${base} text-amber-500`} />;
    if (type === 'system' || status === 'error')
      return <AlertTriangle className={`${base} text-red-500`} />;
    return <Bell className={`${base} text-gray-500`} />;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 relative">
      <div className="flex items-center justify-between">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search leads, campaigns..."
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aqua focus:border-transparent"
            />
            {searchOpen && hasSearchContent && (
              <div className="absolute mt-2 left-0 w-[28rem] bg-white border border-gray-200 rounded-xl shadow-2xl z-40">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    {searching ? 'Searching...' : 'Search results'}
                  </p>
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setSearchOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.leads.length === 0 && searchResults.campaigns.length === 0 && !searching && (
                    <div className="px-4 py-3 text-sm text-gray-500">No results found.</div>
                  )}
                  {searchResults.leads.length > 0 && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">LEADS</p>
                      <div className="space-y-2">
                        {searchResults.leads.map((lead) => (
                          <button
                            key={lead.id}
                            className="w-full text-left flex items-center justify-between text-sm hover:bg-gray-50 px-2 py-1 rounded"
                            onClick={() => {
                              router.push(`/leads/search?leadId=${lead.id}`);
                              setSearchOpen(false);
                            }}
                          >
                            <div>
                              <p className="font-medium text-gray-800">{lead.name}</p>
                              <p className="text-xs text-gray-500">{lead.email || 'No email'}</p>
                            </div>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 capitalize">
                              {lead.status || 'new'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchResults.campaigns.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-[11px] font-semibold text-gray-500 mb-2">CAMPAIGNS</p>
                      <div className="space-y-2">
                        {searchResults.campaigns.map((camp) => (
                          <div key={camp.id} className="flex flex-col text-sm">
                            <p className="font-medium text-gray-800">{camp.name}</p>
                            <p className="text-xs text-gray-500">{camp.subject}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((prev) => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[11px] leading-[18px] text-white bg-red-500 rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Notifications</p>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'Up to date'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchNotifications}
                      className="text-xs text-aqua hover:text-teal font-semibold"
                      disabled={loadingNotifications}
                    >
                      {loadingNotifications ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                  )}
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 px-4 py-3 ${!item.read ? 'bg-aqua/5' : ''}`}
                    >
                      <div className="mt-1">
                        {renderIcon(item.type, item.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                          <button
                            onClick={() => markRead(item.id)}
                            className="text-[11px] text-gray-400 hover:text-gray-700"
                          >
                            Mark read
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{item.message}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-10 h-10 bg-aqua rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-teal" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
