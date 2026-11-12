-- ==============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Add logo_url column to site_content
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Add site_content to Supabase Realtime publication (for instant live sync)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
  END IF;
END $$;

-- 3. Reload PostgREST schema cache so the API immediately recognizes the column
NOTIFY pgrst, 'reload schema';
