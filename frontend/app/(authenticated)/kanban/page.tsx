'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Link as LinkIcon, Phone, Mail, Clock, CheckCircle2, MoreVertical } from 'lucide-react';

interface KanbanStage {
  id: string;
  name: string;
  position: number;
  color: string | null;
}

interface Lead {
  id: string;
  name: string;
  business_type: string;
  city: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: string;
}

interface KanbanCard {
  lead: Lead;
  stage_id: string;
  position: number;
}

export default function KanbanPage() {
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [cards, setCards] = useState<Map<string, KanbanCard[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const fetchKanbanData = async () => {
    setLoading(true);
    try {
      // Fetch stages
      const { data: stagesData, error: stagesError } = await supabase
        .from('kanban_stages')
        .select('*')
        .order('position');

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Fetch leads with their kanban positions
      const { data: kanbanData, error: kanbanError } = await supabase
        .from('lead_kanban')
        .select(`
          id,
          position,
          stage_id,
          lead_id,
          leads (
            id,
            name,
            business_type,
            city,
            email,
            phone,
            website,
            status
          )
        `)
        .order('position');

      if (kanbanError) throw kanbanError;

      // Organize cards by stage
      const cardsByStage = new Map<string, KanbanCard[]>();
      stagesData?.forEach(stage => {
        cardsByStage.set(stage.id, []);
      });

      kanbanData?.forEach((item: any) => {
        // Handle the nested leads structure from Supabase join
        const leadData = item.leads;
        if (leadData && typeof leadData === 'object') {
          const stageCards = cardsByStage.get(item.stage_id) || [];
          stageCards.push({
            lead: leadData,
            stage_id: item.stage_id,
            position: item.position,
          });
          cardsByStage.set(item.stage_id, stageCards);
        }
      });

      setCards(cardsByStage);
    } catch (error) {
      console.error('Error fetching kanban data:', error);
      toast.error('Failed to load kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (card: KanbanCard) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStageId: string) => {
    if (!draggedCard) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('lead_kanban')
        .update({ stage_id: targetStageId, moved_at: new Date().toISOString() })
        .eq('lead_id', draggedCard.lead.id);

      if (error) throw error;

      toast.success('Lead moved successfully');
      await fetchKanbanData();
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move lead');
    } finally {
      setDraggedCard(null);
    }
  };

  const confirmPartner = async (leadId: string) => {
    try {
      // Find "Confirmed Partner" stage
      const confirmedStage = stages.find(s => s.name === 'Confirmed Partner');
      if (!confirmedStage) {
        toast.error('Confirmed Partner stage not found');
        return;
      }

      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'partner' })
        .eq('id', leadId);

      if (leadError) throw leadError;

      // Move to confirmed stage
      const { error: kanbanError } = await supabase
        .from('lead_kanban')
        .update({ stage_id: confirmedStage.id, moved_at: new Date().toISOString() })
        .eq('lead_id', leadId);

      if (kanbanError) throw kanbanError;

      toast.success('Partner confirmed!');
      await fetchKanbanData();
    } catch (error) {
      console.error('Error confirming partner:', error);
      toast.error('Failed to confirm partner');
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Outreach Workflow" subtitle="Drag and drop to manage your partner outreach pipeline" />
        <div className="p-8 flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-aqua border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Outreach Workflow"
        subtitle="Drag and drop to manage your partner outreach pipeline"
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Select All
            </button>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Bulk Action
            </button>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Delete
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>All Campaigns</option>
              <option>Q1 2024</option>
              <option>Hotels Campaign</option>
            </select>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Campaign Redo
            </button>
            <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Filter
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageCards = cards.get(stage.id) || [];
            const isConfirmedStage = stage.name === 'Confirmed Partner';
            const isPotentialStage = stage.name === 'Potential Partner';

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column Header */}
                <div className="bg-white rounded-t-lg border border-gray-200 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{stage.name}</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Cards Container */}
                <div
                  className="bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg p-4 min-h-[600px] space-y-3"
                  style={{ borderTopColor: stage.color || '#E5E7EB' }}
                >
                  {stageCards.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm text-gray-400">Drag cards here</p>
                    </div>
                  ) : (
                    stageCards.map((card) => (
                      <div
                        key={card.lead.id}
                        draggable
                        onDragStart={() => handleDragStart(card)}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{card.lead.name}</h4>
                            <p className="text-sm text-gray-600">{card.lead.business_type}</p>
                            <p className="text-xs text-gray-500 mt-1">{card.lead.city}</p>
                          </div>
                          <input type="checkbox" className="w-4 h-4 text-aqua rounded" />
                        </div>

                        {/* Status Badge */}
                        {card.lead.status && (
                          <div className="mb-3">
                            {card.lead.status === 'enriched' && (
                              <span className="badge badge-aqua">Enriched</span>
                            )}
                            {card.lead.status === 'contact-missing' && (
                              <span className="badge badge-warning">Contact Missing</span>
                            )}
                            {card.lead.status === 'replied' && (
                              <span className="badge badge-success">Replied</span>
                            )}
                            {card.lead.status === 'contacted' && (
                              <span className="badge badge-info">Contacted</span>
                            )}
                            {isPotentialStage && (
                              <span className="badge bg-orange-100 text-orange-800 ml-2">Interested</span>
                            )}
                            {isConfirmedStage && (
                              <span className="badge badge-success ml-2 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirmed</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Icons */}
                        <div className="flex items-center space-x-2 text-gray-400">
                          {card.lead.website && (
                            <button
                              onClick={() => window.open(card.lead.website!, '_blank')}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Visit website"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                          {card.lead.phone && (
                            <button
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                          {card.lead.email && (
                            <button
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                            title="History"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Confirm Partner Button */}
                        {isPotentialStage && (
                          <button
                            onClick={() => confirmPartner(card.lead.id)}
                            className="btn btn-primary w-full mt-3 py-2 text-sm flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Partner</span>
                          </button>
                        )}
                      </div>
                    ))
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
