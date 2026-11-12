-- ==============================================================================
-- MIGRATION: Add Dynamic Title and Location columns for Exhibition Plates
-- Run this in your Supabase SQL Editor:
-- ==============================================================================

ALTER TABLE public.site_content 
  ADD COLUMN IF NOT EXISTS chapter_2_plate_1_title TEXT DEFAULT 'First Rizal Monument',
  ADD COLUMN IF NOT EXISTS chapter_2_plate_1_location TEXT DEFAULT 'Barangay Poblacion, Daet',
  ADD COLUMN IF NOT EXISTS chapter_2_plate_2_title TEXT DEFAULT 'Cathedral of San Juan Bautista',
  ADD COLUMN IF NOT EXISTS chapter_2_plate_2_location TEXT DEFAULT 'Diocese of Daet',
  ADD COLUMN IF NOT EXISTS chapter_2_quote_attribution TEXT DEFAULT '— Historical Inscription, Daet Revolutionary Annals';

-- Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
