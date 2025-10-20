-- Debug Kanban Board Issue
-- Run this in Supabase SQL Editor to diagnose why Kanban board is empty

-- 1. Check for duplicate stages
SELECT
  name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as stage_ids
FROM kanban_stages
GROUP BY name
ORDER BY name;

-- 2. Check all stages
SELECT * FROM kanban_stages ORDER BY position;

-- 3. Check lead_kanban relationships
SELECT
  lk.stage_id,
  COUNT(*) as lead_count,
  ks.name as stage_name,
  ks.id as actual_stage_id
FROM lead_kanban lk
LEFT JOIN kanban_stages ks ON ks.id = lk.stage_id
GROUP BY lk.stage_id, ks.name, ks.id
ORDER BY ks.position;

-- 4. Check for orphaned lead_kanban entries (stage_id doesn't match any stage)
SELECT
  lk.*,
  l.name as lead_name
FROM lead_kanban lk
LEFT JOIN kanban_stages ks ON ks.id = lk.stage_id
LEFT JOIN leads l ON l.id = lk.lead_id
WHERE ks.id IS NULL;

-- 5. Check sample lead_kanban entries with full lead data
SELECT
  lk.stage_id,
  ks.name as stage_name,
  l.id as lead_id,
  l.name as lead_name,
  l.email,
  l.phone,
  l.business_type,
  l.city
FROM lead_kanban lk
JOIN leads l ON l.id = lk.lead_id
LEFT JOIN kanban_stages ks ON ks.id = lk.stage_id
ORDER BY ks.position, lk.position
LIMIT 20;
