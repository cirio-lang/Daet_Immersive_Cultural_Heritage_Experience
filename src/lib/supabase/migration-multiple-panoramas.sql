-- ==============================================================================
-- DAET IMMERSIVE CULTURAL HERITAGE EXPERIENCE
-- Migration: Multiple 360° Panoramas Per Heritage Site
-- Execute this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. CREATE HERITAGE PANORAMAS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.heritage_panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  panorama_url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Main View',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for fast ordering and querying panoramas by site
CREATE INDEX IF NOT EXISTS idx_heritage_panoramas_site_id ON public.heritage_panoramas(site_id, sort_order);

-- 2. MIGRATE EXISTING PANORAMAS FROM heritage_sites.panorama_360_url
-- ------------------------------------------------------------------------------
-- Migrate any existing single panorama URL as the initial "Main View" (sort_order = 0)
INSERT INTO public.heritage_panoramas (site_id, panorama_url, label, sort_order)
SELECT 
  hs.id AS site_id,
  hs.panorama_360_url,
  'Main View' AS label,
  0 AS sort_order
FROM public.heritage_sites hs
WHERE hs.panorama_360_url IS NOT NULL 
  AND TRIM(hs.panorama_360_url) != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.heritage_panoramas hp 
    WHERE hp.site_id = hs.id
  );

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.heritage_panoramas ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR HERITAGE PANORAMAS
-- ------------------------------------------------------------------------------
-- Public Select: Visitors can view panoramas of published heritage sites; Admins can view all
DROP POLICY IF EXISTS "heritage_panoramas_select_policy" ON public.heritage_panoramas;
CREATE POLICY "heritage_panoramas_select_policy"
  ON public.heritage_panoramas
  FOR SELECT
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.heritage_sites hs
      WHERE hs.id = site_id AND hs.is_published = true
    )
  );

-- Admin Insert: Only admins can add panoramas
DROP POLICY IF EXISTS "heritage_panoramas_insert_policy" ON public.heritage_panoramas;
CREATE POLICY "heritage_panoramas_insert_policy"
  ON public.heritage_panoramas
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin Update: Only admins can update panoramas
DROP POLICY IF EXISTS "heritage_panoramas_update_policy" ON public.heritage_panoramas;
CREATE POLICY "heritage_panoramas_update_policy"
  ON public.heritage_panoramas
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin Delete: Only admins can delete panoramas
DROP POLICY IF EXISTS "heritage_panoramas_delete_policy" ON public.heritage_panoramas;
CREATE POLICY "heritage_panoramas_delete_policy"
  ON public.heritage_panoramas
  FOR DELETE
  USING (public.is_admin());
