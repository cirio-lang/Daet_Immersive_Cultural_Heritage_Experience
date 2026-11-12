-- ==============================================================================
-- DAET IMMERSIVE CULTURAL HERITAGE EXPERIENCE
-- Migration: Repeatable Additional Sections (JSONB) on heritage_sites
-- Execute this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. ADD additional_sections JSONB COLUMN
-- ------------------------------------------------------------------------------
ALTER TABLE public.heritage_sites
ADD COLUMN IF NOT EXISTS additional_sections JSONB DEFAULT '[]'::jsonb;

-- 2. MIGRATE EXISTING significance DATA INTO additional_sections
-- ------------------------------------------------------------------------------
-- If an existing site has content in the legacy `significance` column, migrate it
-- into the new `additional_sections` array as a "Cultural Significance" entry.
UPDATE public.heritage_sites
SET additional_sections = jsonb_build_array(
  jsonb_build_object(
    'label', 'Cultural Significance',
    'content', significance
  )
)
WHERE significance IS NOT NULL 
  AND TRIM(significance) != '' 
  AND (additional_sections IS NULL OR additional_sections = '[]'::jsonb);

-- 3. ENSURE municipality & province DEFAULTS
-- ------------------------------------------------------------------------------
ALTER TABLE public.heritage_sites
ALTER COLUMN municipality SET DEFAULT 'Daet',
ALTER COLUMN province SET DEFAULT 'Camarines Norte';
