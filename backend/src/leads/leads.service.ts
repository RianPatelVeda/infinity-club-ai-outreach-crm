import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

@Injectable()
export class LeadsService {
  constructor(private supabaseService: SupabaseService) {}

  async createManualLead(leadData: {
    name: string;
    business_type: string;
    city: string;
    website?: string;
    phone?: string;
    email?: string;
  }) {
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

    // Check for duplicates
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('name', leadData.name)
      .eq('city', leadData.city)
      .single();

    if (existing) {
      throw new Error('Lead with this name already exists in this city');
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        source: 'manual',
        status: 'new',
        enrichment_status: {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    // Add to kanban (Not Contacted stage)
    const { data: notContactedStage } = await supabase
      .from('kanban_stages')
      .select('id')
      .eq('name', 'Not Contacted')
      .single();

    if (notContactedStage) {
      await supabase.from('lead_kanban').insert({
        lead_id: lead.id,
        stage_id: notContactedStage.id,
        position: 0,
      });
    }

    return lead;
  }

  async updateLead(
    id: string,
    updates: {
      name?: string;
      business_type?: string;
      city?: string;
      website?: string;
      phone?: string;
      email?: string;
      notes?: string;
    },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return lead;
  }

  async deleteLead(id: string) {
    const supabase = this.supabaseService.getClient();

    // Delete kanban entries first (foreign key constraint)
    await supabase.from('lead_kanban').delete().eq('lead_id', id);

    // Delete the lead
    const { error } = await supabase.from('leads').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }

    return true;
  }
}
