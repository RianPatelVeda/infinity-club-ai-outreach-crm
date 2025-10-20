-- Fix Kanban Stage Issues
-- This script will clean up duplicate stages and fix orphaned lead_kanban entries

-- STEP 1: Check current state
SELECT 'Current stages:' as info;
SELECT id, name, position, color FROM kanban_stages ORDER BY position;

SELECT 'Lead distribution:' as info;
SELECT
  lk.stage_id,
  ks.name as stage_name,
  COUNT(*) as lead_count
FROM lead_kanban lk
LEFT JOIN kanban_stages ks ON ks.id = lk.stage_id
GROUP BY lk.stage_id, ks.name;

-- STEP 2: Find and remove duplicate stages (keep the one with lowest position)
WITH duplicate_stages AS (
  SELECT
    name,
    MIN(id) as keep_id,
    ARRAY_AGG(id) as all_ids
  FROM kanban_stages
  GROUP BY name
  HAVING COUNT(*) > 1
)
SELECT 'Duplicate stages found:' as info;
SELECT * FROM duplicate_stages;

-- Update lead_kanban to use the kept stage ID for duplicates
UPDATE lead_kanban lk
SET stage_id = ds.keep_id
FROM duplicate_stages ds
WHERE lk.stage_id = ANY(ds.all_ids)
  AND lk.stage_id != ds.keep_id;

-- Delete duplicate stages (keep only the first one)
DELETE FROM kanban_stages ks
USING duplicate_stages ds
WHERE ks.id = ANY(ds.all_ids)
  AND ks.id != ds.keep_id;

-- STEP 3: Ensure we have exactly 5 default stages
DO $$
DECLARE
  first_contact_id UUID;
BEGIN
  -- Get or create "First Contact" stage
  SELECT id INTO first_contact_id
  FROM kanban_stages
  WHERE name = 'First Contact'
  LIMIT 1;

  IF first_contact_id IS NULL THEN
    INSERT INTO kanban_stages (name, position, color)
    VALUES ('First Contact', 1, '#3B82F6')
    RETURNING id INTO first_contact_id;
  END IF;

  -- Ensure other stages exist
  INSERT INTO kanban_stages (name, position, color)
  VALUES
    ('Follow-up', 2, '#F59E0B'),
    ('Negotiation', 3, '#8B5CF6'),
    ('Potential Partner', 4, '#10B981'),
    ('Confirmed Partner', 5, '#059669')
  ON CONFLICT (name) DO NOTHING;

  -- Fix orphaned lead_kanban entries (assign to First Contact)
  UPDATE lead_kanban
  SET stage_id = first_contact_id
  WHERE stage_id NOT IN (SELECT id FROM kanban_stages);

  RAISE NOTICE 'Kanban stages fixed!';
END $$;

-- STEP 4: Verify the fix
SELECT 'Final stages:' as info;
SELECT id, name, position, color FROM kanban_stages ORDER BY position;

SELECT 'Final lead distribution:' as info;
SELECT
  ks.name as stage_name,
  ks.id as stage_id,
  COUNT(lk.lead_id) as lead_count
FROM kanban_stages ks
LEFT JOIN lead_kanban lk ON lk.stage_id = ks.id
GROUP BY ks.id, ks.name
ORDER BY ks.position;

SELECT 'Fix complete!' as message;
