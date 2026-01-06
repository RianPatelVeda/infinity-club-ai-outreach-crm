'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Mail, CheckCircle, Gift, Briefcase, Eye, MousePointerClick, XCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_type: string;
  city: string;
  website: string | null;
  notes: string | null;
  created_at: string;
}

interface KanbanCard extends Lead {
  stage_id: string;
  position: number;
  outreach_history?: Array<{
    type: string;
    subject: string;
    metadata: any;
    created_at: string;
    opened: boolean;
    clicked: boolean;
    bounced: boolean;
    delivered: boolean;
  }>;
}

interface KanbanStage {
  id: string;
  name: string;
  color: string;
  position: number;
}

export default function KanbanPage() {
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [cards, setCards] = useState<Record<string, KanbanCard[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeKanban();
  }, []);

  const initializeKanban = async () => {
    try {
      // First, ensure the correct stages exist
      await setupStages();

      // Then fetch the data
      await fetchKanbanData();
    } catch (error) {
      console.error('Error initializing kanban:', error);
      toast.error('Failed to load kanban board');
    } finally {
      setLoading(false);
    }
  };

  const setupStages = async () => {
    // Use backend API to setup stages
    await api.post('/analytics/kanban-stages/setup');
  };

  const fetchKanbanData = async () => {
    // Use backend API instead of direct Supabase calls
    const [stagesRes, kanbanRes] = await Promise.all([
      api.get('/analytics/kanban-stages'),
      api.get('/analytics/kanban-data'),
    ]);

    const stagesData = stagesRes.data || [];
    const kanbanData = kanbanRes.data || [];

    setStages(stagesData);

    // Get outreach history for all leads
    const leadIds = kanbanData.map((k: any) => k.lead_id);
    let outreachData: any[] = [];
    if (leadIds.length > 0) {
      const outreachRes = await api.get('/analytics/outreach-history', {
        params: { leadIds: leadIds.join(',') },
      });
      outreachData = outreachRes.data || [];
    }

    // Organize cards by stage
    const cardsByStage: Record<string, KanbanCard[]> = {};
    stagesData.forEach((stage: KanbanStage) => {
      cardsByStage[stage.id] = [];
    });

    kanbanData.forEach((item: any) => {
      if (item.leads) {
        const lead = item.leads as any;
        const history = outreachData.filter((h: any) => h.lead_id === lead.id) || [];

        cardsByStage[item.stage_id]?.push({
          ...lead,
          stage_id: item.stage_id,
          position: item.position,
          outreach_history: history,
        });
      }
    });

    setCards(cardsByStage);
  };

  const moveToStage = async (leadId: string, fromStageId: string, toStageId: string, stageName: string) => {
    try {
      // Use backend API instead of direct Supabase call
      await api.put('/analytics/lead-kanban/move', { leadId, toStageId });

      // Update local state
      const fromCards = cards[fromStageId] || [];
      const toCards = cards[toStageId] || [];

      const card = fromCards.find(c => c.id === leadId);
      if (card) {
        setCards({
          ...cards,
          [fromStageId]: fromCards.filter(c => c.id !== leadId),
          [toStageId]: [...toCards, { ...card, stage_id: toStageId }],
        });

        toast.success(`Moved to ${stageName}`);
      }
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move card');
    }
  };

  const getStageIcon = (stageName: string) => {
    switch (stageName) {
      case 'Not Contacted':
        return <Mail className="w-4 h-4" />;
      case 'Contacted - Christmas':
        return <Gift className="w-4 h-4" />;
      case 'Contacted - Partner':
        return <Briefcase className="w-4 h-4" />;
      case 'Employee Benefit Business':
      case 'Partner':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getEmailStats = (card: KanbanCard) => {
    const emails = card.outreach_history?.filter(h => h.type === 'email') || [];
    const templateType = emails[0]?.metadata?.template_type;
    const hasOpened = emails.some(e => e.opened);
    const hasClicked = emails.some(e => e.clicked);
    const hasBounced = emails.some(e => e.bounced);
    const allDelivered = emails.length > 0 && emails.every(e => e.delivered);

    return {
      count: emails.length,
      templateType: templateType || 'none',
      lastSent: emails[0]?.created_at,
      hasOpened,
      hasClicked,
      hasBounced,
      allDelivered,
    };
  };

  if (loading) {
    return (
      <div>
        <Header title="Pipeline" subtitle="Manage your outreach pipeline" />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Pipeline" subtitle="Manage your outreach pipeline" />

      <div className="p-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageCards = cards[stage.id] || [];
            const employeeBenefitStage = stages.find(s => s.name === 'Employee Benefit Business');
            const partnerStage = stages.find(s => s.name === 'Partner');

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-bold text-sm uppercase text-gray-700">
                      {stage.name}
                    </h3>
                    <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-600">
                      {stageCards.length}
                    </span>
                  </div>
                  {getStageIcon(stage.name)}
                </div>

                <div className="space-y-3">
                  {stageCards.map((card) => {
                    const emailStats = getEmailStats(card);

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <h4 className="font-semibold text-sm mb-2">{card.name}</h4>
                        <p className="text-xs text-gray-600 mb-2">{card.business_type}</p>
                        <p className="text-xs text-gray-500 mb-3">{card.city}</p>

                        {emailStats.count > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3 text-xs">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-blue-700 font-medium">
                                {emailStats.count} email{emailStats.count > 1 ? 's' : ''} sent
                              </span>
                            </div>

                            {/* Engagement Indicators */}
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              {emailStats.allDelivered && (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  Delivered
                                </span>
                              )}
                              {emailStats.hasOpened && (
                                <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">
                                  <Eye className="w-3 h-3" />
                                  Opened
                                </span>
                              )}
                              {emailStats.hasClicked && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                  <MousePointerClick className="w-3 h-3" />
                                  Clicked
                                </span>
                              )}
                              {emailStats.hasBounced && (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                  <XCircle className="w-3 h-3" />
                                  Bounced
                                </span>
                              )}
                            </div>

                            {emailStats.templateType !== 'none' && (
                              <p className="text-blue-600">
                                Template: {emailStats.templateType === 'partner_acquisition_email' ? 'Partner' : 'Christmas'}
                              </p>
                            )}
                          </div>
                        )}

                        {card.email && (
                          <p className="text-xs text-gray-500 mb-2">✉️ {card.email}</p>
                        )}
                        {card.phone && (
                          <p className="text-xs text-gray-500 mb-3">📞 {card.phone}</p>
                        )}

                        {/* Action buttons for specific stages */}
                        {stage.name === 'Contacted - Christmas' && employeeBenefitStage && (
                          <button
                            onClick={() => moveToStage(card.id, stage.id, employeeBenefitStage.id, employeeBenefitStage.name)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                          >
                            ✓ Confirm Employee Benefit
                          </button>
                        )}

                        {stage.name === 'Contacted - Partner' && partnerStage && (
                          <button
                            onClick={() => moveToStage(card.id, stage.id, partnerStage.id, partnerStage.name)}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                          >
                            ✓ Confirm as Partner
                          </button>
                        )}

                        {stage.name === 'Employee Benefit Business' && partnerStage && (
                          <button
                            onClick={() => moveToStage(card.id, stage.id, partnerStage.id, partnerStage.name)}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                          >
                            ✓ Also Mark as Partner
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {stageCards.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      No leads in this stage
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
