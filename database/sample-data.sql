-- Sample Data for Testing
-- Run this in Supabase SQL Editor to populate the CRM with test leads

-- Insert sample leads
INSERT INTO leads (name, business_type, city, website, phone, email, status, source, enrichment_status) VALUES
  ('The Grand Hotel', 'Luxury Hotel', 'New York', 'https://grandhotel.com', '(212) 555-0100', 'contact@grandhotel.com', 'new', 'scraped', '{"email_verified": true, "phone_verified": true}'),
  ('Skyline Restaurant', 'Fine Dining', 'San Francisco', 'https://skylinerestaurant.com', '(415) 555-0200', 'info@skylinerestaurant.com', 'enriched', 'scraped', '{"email_verified": true}'),
  ('Tech Innovators Inc', 'SaaS Company', 'Austin', 'https://techinnovators.io', '(512) 555-0300', 'hello@techinnovators.io', 'contacted', 'manual', '{"enrichment_used": true}'),
  ('Boutique Spa & Wellness', 'Spa', 'Miami', 'https://boutiquespa.com', '(305) 555-0400', NULL, 'new', 'scraped', '{}'),
  ('Urban Coffee House', 'Coffee Shop', 'Seattle', 'https://urbancoffee.com', NULL, 'orders@urbancoffee.com', 'new', 'scraped', '{"email_verified": true}'),
  ('Elite Fitness Center', 'Gym', 'Los Angeles', 'https://elitefitness.com', '(310) 555-0600', 'membership@elitefitness.com', 'replied', 'scraped', '{"email_verified": true, "phone_verified": true}'),
  ('Artisan Bakery', 'Bakery', 'Portland', NULL, '(503) 555-0700', NULL, 'new', 'manual', '{}'),
  ('Coastal Events Venue', 'Event Space', 'San Diego', 'https://coastalevents.com', '(619) 555-0800', 'bookings@coastalevents.com', 'contacted', 'scraped', '{"email_verified": true}'),
  ('Downtown Auto Detailing', 'Car Detailing', 'Chicago', 'https://downtownauto.com', '(312) 555-0900', NULL, 'new', 'scraped', '{"phone_verified": true}'),
  ('Prestige Real Estate', 'Real Estate', 'Boston', 'https://prestigerealestate.com', '(617) 555-1000', 'agents@prestigerealestate.com', 'new', 'scraped', '{"email_verified": true}');

-- Assign leads to kanban stages
DO $$
DECLARE
  first_contact_id UUID;
  followup_id UUID;
  negotiation_id UUID;
  potential_id UUID;
  confirmed_id UUID;
  lead_record RECORD;
BEGIN
  -- Get stage IDs
  SELECT id INTO first_contact_id FROM kanban_stages WHERE name = 'First Contact';
  SELECT id INTO followup_id FROM kanban_stages WHERE name = 'Follow-up';
  SELECT id INTO negotiation_id FROM kanban_stages WHERE name = 'Negotiation';
  SELECT id INTO potential_id FROM kanban_stages WHERE name = 'Potential Partner';
  SELECT id INTO confirmed_id FROM kanban_stages WHERE name = 'Confirmed Partner';

  -- Assign leads to stages based on their status
  FOR lead_record IN SELECT id, status FROM leads LOOP
    IF lead_record.status = 'new' THEN
      INSERT INTO lead_kanban (lead_id, stage_id, position) VALUES (lead_record.id, first_contact_id, 0);
    ELSIF lead_record.status IN ('enriched', 'contacted') THEN
      INSERT INTO lead_kanban (lead_id, stage_id, position) VALUES (lead_record.id, followup_id, 0);
    ELSIF lead_record.status = 'replied' THEN
      INSERT INTO lead_kanban (lead_id, stage_id, position) VALUES (lead_record.id, potential_id, 0);
    END IF;
  END LOOP;
END $$;

-- Insert sample outreach history
INSERT INTO outreach_history (lead_id, type, status, subject, content, created_at)
SELECT
  id,
  'email',
  'sent',
  'Partnership Opportunity with Infinity Club',
  'Hi there, Hope you''re having a great week. I''m reaching out from Infinity Club...',
  NOW() - INTERVAL '2 days'
FROM leads
WHERE status IN ('contacted', 'replied')
LIMIT 3;
