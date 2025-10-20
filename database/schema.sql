-- Infinity Club CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  business_type VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(50) DEFAULT 'scraped', -- 'scraped' or 'manual'
  date_scraped TIMESTAMP DEFAULT NOW(),
  enrichment_status JSONB DEFAULT '{}', -- {phone_verified, email_verified, enrichment_used}
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of variable names like ["{firstName}", "{companyName}"]
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  subject VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, failed
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Campaign recipients (many-to-many)
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, delivered, failed, bounced
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  replied_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, lead_id)
);

-- Outreach history (timeline of all interactions)
CREATE TABLE outreach_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- email, call, note, status_change
  status VARCHAR(50), -- sent, delivered, failed, etc.
  subject VARCHAR(500),
  content TEXT,
  metadata JSONB DEFAULT '{}', -- Additional data (error messages, call duration, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Kanban stages
CREATE TABLE kanban_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead kanban position
CREATE TABLE lead_kanban (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES kanban_stages(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  moved_at TIMESTAMP DEFAULT NOW(),
  moved_by UUID REFERENCES auth.users(id),
  UNIQUE(lead_id)
);

-- Scrape history (track what's been scraped to avoid duplicates)
CREATE TABLE scrape_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_type VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  results_count INTEGER DEFAULT 0,
  scraped_at TIMESTAMP DEFAULT NOW(),
  scraped_by UUID REFERENCES auth.users(id)
);

-- Scraped business identifiers (for deduplication)
CREATE TABLE scraped_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrape_history_id UUID REFERENCES scrape_history(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  phone VARCHAR(50),
  gmb_id VARCHAR(255), -- Google My Business place ID
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(gmb_id)
);

-- Insert default kanban stages
INSERT INTO kanban_stages (name, position, color) VALUES
  ('First Contact', 1, '#8DEAF1'),
  ('Follow-up', 2, '#6DD8E8'),
  ('Negotiation', 3, '#27565E'),
  ('Potential Partner', 4, '#FFA500'),
  ('Confirmed Partner', 5, '#00C853');

-- Insert default email template
INSERT INTO email_templates (name, subject, content, variables, is_default) VALUES
  ('Initial Outreach',
   'Partnership Opportunity with Infinity Club',
   'Hi {firstName},

Hope you''re having a great week.

I''m reaching out from Infinity Club to explore potential partnership opportunities with {companyName}. We''ve been impressed with your work in the industry.

Looking forward to connecting.

Best,
{yourName}',
   '["firstName", "companyName", "yourName"]',
   true);

-- Indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_business_type ON leads(business_type);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_outreach_history_lead_id ON outreach_history(lead_id);
CREATE INDEX idx_outreach_history_created_at ON outreach_history(created_at DESC);
CREATE INDEX idx_lead_kanban_stage_id ON lead_kanban(stage_id);
CREATE INDEX idx_scraped_businesses_gmb_id ON scraped_businesses(gmb_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to access their data)
CREATE POLICY "Users can view all leads" ON leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert leads" ON leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update leads" ON leads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete leads" ON leads FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view templates" ON email_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert templates" ON email_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update templates" ON email_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete templates" ON email_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view campaigns" ON campaigns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert campaigns" ON campaigns FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update campaigns" ON campaigns FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete campaigns" ON campaigns FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view campaign recipients" ON campaign_recipients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert campaign recipients" ON campaign_recipients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update campaign recipients" ON campaign_recipients FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view outreach history" ON outreach_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert outreach history" ON outreach_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view kanban" ON lead_kanban FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert kanban" ON lead_kanban FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update kanban" ON lead_kanban FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view scrape history" ON scrape_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert scrape history" ON scrape_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
