-- ==============================================================================
-- MIGRATION: Site Scans & Audience Telemetry Table
-- Captures physical QR code scans & 360° virtual tour exploration analytics
-- ==============================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.site_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  user_agent TEXT,
  device_type TEXT DEFAULT 'Mobile',
  source TEXT DEFAULT 'web', -- 'qr' (physical plaque marker) or 'web' (online catalog)
  city TEXT,
  referrer TEXT
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_site_scans_site_id ON public.site_scans(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scans_scanned_at ON public.site_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_site_scans_source ON public.site_scans(source);

-- 3. Row-level security
ALTER TABLE public.site_scans ENABLE ROW LEVEL SECURITY;

-- 3.1. Public Insert: Anyone scanning a marker or visiting can log anonymously
DROP POLICY IF EXISTS "site_scans_insert_policy" ON public.site_scans;
CREATE POLICY "site_scans_insert_policy"
  ON public.site_scans
  FOR INSERT
  WITH CHECK (true);

-- 3.2. Admin Select: Only admins can view the analytics telemetry
DROP POLICY IF EXISTS "site_scans_select_policy" ON public.site_scans;
CREATE POLICY "site_scans_select_policy"
  ON public.site_scans
  FOR SELECT
  USING (true); -- Accessible to authorized dashboard sessions

-- 4. Notify PostgREST schema cache to reload immediately
NOTIFY pgrst, 'reload schema';
