-- CRITICAL FIX: Clean up kanban stages and fix lead relationships
-- Run this in Supabase SQL Editor NOW

-- Step 1: Delete ALL existing kanban stages and lead_kanban entries (fresh start)
DELETE FROM lead_kanban;
DELETE FROM kanban_stages;

-- Step 2: Create exactly 5 stages with known IDs
INSERT INTO kanban_stages (id, name, position, color)
VALUES
  (gen_random_uuid(), 'First Contact', 1, '#3B82F6'),
  (gen_random_uuid(), 'Follow-up', 2, '#F59E0B'),
  (gen_random_uuid(), 'Negotiation', 3, '#8B5CF6'),
  (gen_random_uuid(), 'Potential Partner', 4, '#10B981'),
  (gen_random_uuid(), 'Confirmed Partner', 5, '#059669');

-- Step 3: Add all existing leads to First Contact stage
INSERT INTO lead_kanban (lead_id, stage_id, position, moved_at)
SELECT
  l.id,
  (SELECT id FROM kanban_stages WHERE name = 'First Contact' LIMIT 1),
  ROW_NUMBER() OVER (ORDER BY l.created_at DESC),
  NOW()
FROM leads l
WHERE NOT EXISTS (
  SELECT 1 FROM lead_kanban lk WHERE lk.lead_id = l.id
);

-- Verify the fix
SELECT 'Stages created:' as info, COUNT(*) as count FROM kanban_stages;
SELECT 'Leads in kanban:' as info, COUNT(*) as count FROM lead_kanban;

SELECT
  ks.name as stage_name,
  COUNT(lk.lead_id) as lead_count
FROM kanban_stages ks
LEFT JOIN lead_kanban lk ON lk.stage_id = ks.id
GROUP BY ks.id, ks.name
ORDER BY ks.position;
