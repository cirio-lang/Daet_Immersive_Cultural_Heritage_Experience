-- ==============================================================================
-- DAET IMMERSIVE CULTURAL HERITAGE EXPERIENCE
-- Full Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK (role IN ('admin', 'visitor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Index for fast role checks in proxy/middleware
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function to check if the current requester is an admin
-- Uses SECURITY DEFINER to bypass RLS inside the function and prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Trigger to automatically create a profile entry when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'visitor')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. HERITAGE SITES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.heritage_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  historical_context TEXT,
  significance TEXT,
  additional_sections JSONB DEFAULT '[]'::jsonb,
  category TEXT NOT NULL DEFAULT 'historical' CHECK (
    category IN ('historical', 'monument', 'religious', 'architectural', 'cultural', 'natural')
  ),
  barangay TEXT NOT NULL,
  municipality TEXT NOT NULL DEFAULT 'Daet',
  province TEXT NOT NULL DEFAULT 'Camarines Norte',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  year_built TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  panorama_360_url TEXT,
  audio_guide_url TEXT,
  qr_code_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Indexes for public browsing, search, and category filtering
CREATE INDEX IF NOT EXISTS idx_heritage_sites_slug ON public.heritage_sites(slug);
CREATE INDEX IF NOT EXISTS idx_heritage_sites_category ON public.heritage_sites(category);
CREATE INDEX IF NOT EXISTS idx_heritage_sites_is_published ON public.heritage_sites(is_published);
CREATE INDEX IF NOT EXISTS idx_heritage_sites_barangay ON public.heritage_sites(barangay);


-- 3. SITE SCANS TELEMETRY (QR Code Scan Analytics)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  user_agent TEXT,
  device_type TEXT,
  city TEXT,
  referrer TEXT
);

CREATE INDEX IF NOT EXISTS idx_site_scans_site_id ON public.site_scans(site_id);
CREATE INDEX IF NOT EXISTS idx_site_scans_scanned_at ON public.site_scans(scanned_at);


-- 4. HERITAGE PANORAMAS TABLE (Multiple 360° Views Per Site)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.heritage_panoramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.heritage_sites(id) ON DELETE CASCADE,
  panorama_url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Main View',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_heritage_panoramas_site_id ON public.heritage_panoramas(site_id, sort_order);


-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heritage_panoramas ENABLE ROW LEVEL SECURITY;

-- 4.1. PROFILES POLICIES
-- Users can view their own profile; Admins can view all profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile; Admins can update any
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4.2. HERITAGE SITES POLICIES
-- Public Read: Anyone (anonymous or visitor) can view if is_published = true.
-- Admins can view all records (both drafts and published).
DROP POLICY IF EXISTS "heritage_sites_select_policy" ON public.heritage_sites;
CREATE POLICY "heritage_sites_select_policy"
  ON public.heritage_sites
  FOR SELECT
  USING (is_published = true OR public.is_admin());

-- Admin Write (INSERT): Only admins can insert new heritage sites
DROP POLICY IF EXISTS "heritage_sites_insert_policy" ON public.heritage_sites;
CREATE POLICY "heritage_sites_insert_policy"
  ON public.heritage_sites
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin Write (UPDATE): Only admins can update heritage sites
DROP POLICY IF EXISTS "heritage_sites_update_policy" ON public.heritage_sites;
CREATE POLICY "heritage_sites_update_policy"
  ON public.heritage_sites
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin Write (DELETE): Only admins can delete heritage sites
DROP POLICY IF EXISTS "heritage_sites_delete_policy" ON public.heritage_sites;
CREATE POLICY "heritage_sites_delete_policy"
  ON public.heritage_sites
  FOR DELETE
  USING (public.is_admin());

-- 4.3. SITE SCANS POLICIES
-- Public Insert: Anyone scanning a physical QR code on site can log a scan anonymously
DROP POLICY IF EXISTS "site_scans_insert_policy" ON public.site_scans;
CREATE POLICY "site_scans_insert_policy"
  ON public.site_scans
  FOR INSERT
  WITH CHECK (true);

-- Admin Select: Only admins can view scan telemetry and statistics
DROP POLICY IF EXISTS "site_scans_select_policy" ON public.site_scans;
CREATE POLICY "site_scans_select_policy"
  ON public.site_scans
  FOR SELECT
  USING (public.is_admin());

-- 4.4. HERITAGE PANORAMAS POLICIES
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


-- 5. STORAGE BUCKET CONFIGURATION (heritage-media)
-- ------------------------------------------------------------------------------
-- Create bucket for photos, 360 panoramic images, and audio guides
INSERT INTO storage.buckets (id, name, public)
VALUES ('heritage-media', 'heritage-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view/download media assets from the heritage-media bucket
DROP POLICY IF EXISTS "heritage_media_public_read" ON storage.objects;
CREATE POLICY "heritage_media_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'heritage-media');

-- Only admins can upload files into the heritage-media bucket
DROP POLICY IF EXISTS "heritage_media_admin_insert" ON storage.objects;
CREATE POLICY "heritage_media_admin_insert"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'heritage-media' AND public.is_admin());

-- Only admins can update/overwrite files in the heritage-media bucket
DROP POLICY IF EXISTS "heritage_media_admin_update" ON storage.objects;
CREATE POLICY "heritage_media_admin_update"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'heritage-media' AND public.is_admin());

-- Only admins can delete files in the heritage-media bucket
DROP POLICY IF EXISTS "heritage_media_admin_delete" ON storage.objects;
CREATE POLICY "heritage_media_admin_delete"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'heritage-media' AND public.is_admin());

-- ==============================================================================
-- 7. SITE_CONTENT TABLE (Landing Page Curation & Custom Logo)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'landing_page',
  logo_url TEXT,
  hero_image_url TEXT,
  hero_badge_text TEXT NOT NULL DEFAULT 'Municipality of Daet • Est. 1583',
  hero_title TEXT NOT NULL DEFAULT 'Daet Immersive Cultural Heritage Experience',
  hero_description TEXT NOT NULL DEFAULT 'A permanent digital exhibition dedicated to preserving the sacred monuments, revolutionary memories, and colonial architecture of the capital town of Camarines Norte through 360° virtual tours.',
  chapter_1_title TEXT NOT NULL DEFAULT 'A Confluence of Revolutionary Valor & Sacred Foundations',
  chapter_1_body TEXT NOT NULL DEFAULT 'Long before modern monuments were erected across the archipelago, the town of Daet stood as a cradle of civic and spiritual identity in the Bicol region. Here, revolutionary leaders and local citizens united in 1898 to construct the world''s first memorial to Dr. Jose Rizal, while four centuries of Franciscan stewardship anchored faith and architecture along the Daet Riverbank.',
  chapter_1_highlights JSONB,
  chapter_2_title TEXT NOT NULL DEFAULT 'Echoes in Stone, Wood & Memory',
  chapter_2_body TEXT NOT NULL DEFAULT 'Every obelisk, altar, and colonial facade across Daet preserves an indelible layer of Philippine consciousness. From the hand-hewn river stones embedded in the First Rizal Monument to the Spanish-era ecclesiastical timbers of the Cathedral, these physical artifacts survive as tangible witnesses to four centuries of courage and community devotion.',
  chapter_2_quote TEXT NOT NULL DEFAULT 'A nation that remembers its monuments in times of peace honors the blood and sacrifice that carved its foundations.',
  chapter_2_quote_attribution TEXT NOT NULL DEFAULT '— Historical Inscription, Daet Revolutionary Annals',
  chapter_2_plate_1_image TEXT NOT NULL DEFAULT '/images/first-rizal-monument.jpg',
  chapter_2_plate_1_title TEXT NOT NULL DEFAULT 'First Rizal Monument',
  chapter_2_plate_1_location TEXT NOT NULL DEFAULT 'Barangay Poblacion, Daet',
  chapter_2_plate_1_caption TEXT NOT NULL DEFAULT 'Constructed by revolutionary forces during the Philippine-American interregnum. Declared National Historical Landmark.',
  chapter_2_plate_2_image TEXT NOT NULL DEFAULT '/images/daet-cathedral.jpg',
  chapter_2_plate_2_title TEXT NOT NULL DEFAULT 'Cathedral of San Juan Bautista',
  chapter_2_plate_2_location TEXT NOT NULL DEFAULT 'Diocese of Daet',
  chapter_2_plate_2_caption TEXT NOT NULL DEFAULT 'Four centuries of Franciscan ministry, architectural preservation, and sacred Bicolano traditions.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_select_policy" ON public.site_content;
CREATE POLICY "site_content_select_policy"
  ON public.site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_content_insert_policy" ON public.site_content;
CREATE POLICY "site_content_insert_policy"
  ON public.site_content FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site_content_update_policy" ON public.site_content;
CREATE POLICY "site_content_update_policy"
  ON public.site_content FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

