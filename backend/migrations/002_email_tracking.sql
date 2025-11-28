-- Create email_tracking table to store SendGrid webhook events
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  email VARCHAR(255) NOT NULL,
  url TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_tracking_lead_id ON email_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_campaign_id ON email_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_event_type ON email_tracking(event_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_timestamp ON email_tracking(timestamp);

-- Add engagement tracking columns to outreach_history
ALTER TABLE outreach_history
  ADD COLUMN IF NOT EXISTS opened BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS clicked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS bounced BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bounced_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Add scraping metrics table
CREATE TABLE IF NOT EXISTS scraping_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  leads_found INTEGER NOT NULL DEFAULT 0,
  leads_with_email INTEGER NOT NULL DEFAULT 0,
  leads_with_phone INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for scraping metrics
CREATE INDEX IF NOT EXISTS idx_scraping_metrics_created_at ON scraping_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_scraping_metrics_business_type ON scraping_metrics(business_type);
CREATE INDEX IF NOT EXISTS idx_scraping_metrics_city ON scraping_metrics(city);

COMMENT ON TABLE email_tracking IS 'Stores all SendGrid webhook events for email tracking';
COMMENT ON TABLE scraping_metrics IS 'Stores metrics from scraping operations';
