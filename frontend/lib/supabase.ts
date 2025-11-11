import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

const assertEnv = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    throw new Error('Supabase browser client was accessed on the server.');
  }

  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = assertEnv();
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
};

export const supabase =
  typeof window === 'undefined'
    ? (null as unknown as SupabaseClient)
    : getSupabaseBrowserClient();

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          business_type: string;
          city: string;
          website: string | null;
          phone: string | null;
          email: string | null;
          status: string;
          source: string;
          date_scraped: string;
          enrichment_status: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };
      campaigns: {
        Row: {
          id: string;
          name: string;
          template_id: string | null;
          subject: string;
          content: string;
          scheduled_at: string | null;
          sent_at: string | null;
          status: string;
          total_recipients: number;
          sent_count: number;
          delivered_count: number;
          failed_count: number;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      email_templates: {
        Row: {
          id: string;
          name: string;
          subject: string;
          content: string;
          variables: any;
          is_default: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
      };
      outreach_history: {
        Row: {
          id: string;
          lead_id: string;
          campaign_id: string | null;
          type: string;
          status: string | null;
          subject: string | null;
          content: string | null;
          metadata: any;
          created_at: string;
          created_by: string | null;
        };
      };
      kanban_stages: {
        Row: {
          id: string;
          name: string;
          position: number;
          color: string | null;
          created_at: string;
        };
      };
      lead_kanban: {
        Row: {
          id: string;
          lead_id: string;
          stage_id: string;
          position: number;
          moved_at: string;
          moved_by: string | null;
        };
      };
    };
  };
};
