-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add chapter_1_highlights column to site_content
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS chapter_1_highlights JSONB;

-- 2. Reload PostgREST schema cache so the API immediately recognizes the column
NOTIFY pgrst, 'reload schema';
