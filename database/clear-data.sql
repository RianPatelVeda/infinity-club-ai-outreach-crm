-- Clear all sample/test data from the CRM
-- Run this in Supabase SQL Editor before testing real scraping

-- Delete in correct order to respect foreign key constraints
DELETE FROM campaign_recipients;
DELETE FROM outreach_history;
DELETE FROM lead_kanban;
DELETE FROM scrape_history;
DELETE FROM leads;
DELETE FROM campaigns;

-- Reset is complete
SELECT 'All sample data cleared successfully!' as message;
