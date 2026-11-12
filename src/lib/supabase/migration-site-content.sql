-- ==============================================================================
-- DAET IMMERSIVE CULTURAL HERITAGE EXPERIENCE
-- Migration: Site Content Management & Fallback Heritage Sites Draft Seeding
-- ==============================================================================

-- 1. CREATE SITE_CONTENT TABLE (Singleton configuration for landing page)
-- ------------------------------------------------------------------------------
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
  chapter_2_plate_1_image TEXT NOT NULL DEFAULT '/images/first-rizal-monument.jpg',
  chapter_2_plate_1_caption TEXT NOT NULL DEFAULT 'Constructed by revolutionary forces during the Philippine-American interregnum. Declared National Historical Landmark.',
  chapter_2_plate_2_image TEXT NOT NULL DEFAULT '/images/daet-cathedral.jpg',
  chapter_2_plate_2_caption TEXT NOT NULL DEFAULT 'Four centuries of Franciscan ministry, architectural preservation, and sacred Bicolano traditions.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Ensure columns exist for existing tables
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS chapter_1_highlights JSONB;

-- 2. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public Read: Everyone (anonymous or logged in) can view the site content
DROP POLICY IF EXISTS "site_content_select_policy" ON public.site_content;
CREATE POLICY "site_content_select_policy"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Admin Insert: Only administrators can insert config rows
DROP POLICY IF EXISTS "site_content_insert_policy" ON public.site_content;
CREATE POLICY "site_content_insert_policy"
  ON public.site_content
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admin Update: Only administrators can update the site content
DROP POLICY IF EXISTS "site_content_update_policy" ON public.site_content;
CREATE POLICY "site_content_update_policy"
  ON public.site_content
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. SEED INITIAL SITE CONTENT SINGLETON ROW
-- ------------------------------------------------------------------------------
INSERT INTO public.site_content (
  id,
  logo_url,
  hero_image_url,
  hero_badge_text,
  hero_title,
  hero_description,
  chapter_1_title,
  chapter_1_body,
  chapter_2_title,
  chapter_2_body,
  chapter_2_quote,
  chapter_2_plate_1_image,
  chapter_2_plate_1_caption,
  chapter_2_plate_2_image,
  chapter_2_plate_2_caption
) VALUES (
  'landing_page',
  NULL,
  NULL,
  'Municipality of Daet • Est. 1583',
  'Daet Immersive Cultural Heritage Experience',
  'A permanent digital exhibition dedicated to preserving the sacred monuments, revolutionary memories, and colonial architecture of the capital town of Camarines Norte through 360° virtual tours.',
  'A Confluence of Revolutionary Valor & Sacred Foundations',
  'Long before modern monuments were erected across the archipelago, the town of Daet stood as a cradle of civic and spiritual identity in the Bicol region. Here, revolutionary leaders and local citizens united in 1898 to construct the world''s first memorial to Dr. Jose Rizal, while four centuries of Franciscan stewardship anchored faith and architecture along the Daet Riverbank.',
  'Echoes in Stone, Wood & Memory',
  'Every obelisk, altar, and colonial facade across Daet preserves an indelible layer of Philippine consciousness. From the hand-hewn river stones embedded in the First Rizal Monument to the Spanish-era ecclesiastical timbers of the Cathedral, these physical artifacts survive as tangible witnesses to four centuries of courage and community devotion.',
  'A nation that remembers its monuments in times of peace honors the blood and sacrifice that carved its foundations.',
  '/images/first-rizal-monument.jpg',
  'Constructed by revolutionary forces during the Philippine-American interregnum. Declared National Historical Landmark.',
  '/images/daet-cathedral.jpg',
  'Four centuries of Franciscan ministry, architectural preservation, and sacred Bicolano traditions.'
) ON CONFLICT (id) DO NOTHING;


-- 4. MIGRATE DEFAULT HERITAGE SITES AS UNPUBLISHED DRAFTS
-- ------------------------------------------------------------------------------
-- Seeds the 3 curated Daet landmarks into heritage_sites as draft records (is_published = false)
-- so administrators can view, edit, enrich, and publish them from the Heritage Sites dashboard.

DO $$
DECLARE
  v_rizal_id UUID;
  v_cathedral_id UUID;
  v_plaza_id UUID;
BEGIN
  -- 4.1 First Rizal Monument
  INSERT INTO public.heritage_sites (
    slug,
    title,
    short_description,
    historical_context,
    significance,
    additional_sections,
    category,
    barangay,
    municipality,
    province,
    latitude,
    longitude,
    year_built,
    cover_image_url,
    gallery_images,
    panorama_360_url,
    is_published
  ) VALUES (
    'first-rizal-monument',
    'First Rizal Monument',
    'The world''s first monument erected in honor of Philippine national hero Dr. Jose Rizal, constructed in 1898 by revolutionary forces.',
    'Constructed in Daet, Camarines Norte following the proclamation of the First Philippine Republic under General Emilio Aguinaldo in December 1898. Led by Lt. Col. Ildefonso Alegre and Lt. Col. Antonio Sanz, the monument was funded entirely through voluntary community contributions from the citizens and Masons of Camarines Norte.',
    'A declared National Historical Landmark that stands as testament to the early reverence and patriotism of the Bicolano people for Dr. Jose Rizal''s ideals, preceding all other monuments built in the Philippines and across the globe.',
    '[{"label": "Architecture & Design", "content": "A three-tiered stone obelisk terminating in a four-sided pyramid, inscribed with Rizal''s novel titles Noli Me Tangere and El Filibusterismo, and Morga''s Sucesos de las Islas Filipinas."}, {"label": "Cultural Significance", "content": "A declared National Historical Landmark that stands as testament to the early reverence and patriotism of the Bicolano people for Dr. Jose Rizal''s ideals, preceding all other monuments built in the Philippines and across the globe."}]'::jsonb,
    'monument',
    'Barangay Poblacion',
    'Daet',
    'Camarines Norte',
    14.1122,
    122.9553,
    '1898',
    '/images/first-rizal-monument.jpg',
    ARRAY['/images/first-rizal-monument.jpg'],
    'https://pannellum.org/images/alma.jpg',
    false -- Draft / Unpublished as requested
  )
  ON CONFLICT (slug) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_rizal_id;

  -- Associated Panoramas for First Rizal Monument
  IF v_rizal_id IS NOT NULL THEN
    INSERT INTO public.heritage_panoramas (site_id, panorama_url, label, sort_order)
    VALUES
      (v_rizal_id, 'https://pannellum.org/images/alma.jpg', 'Main Monument Obelisk', 0),
      (v_rizal_id, 'https://pannellum.org/images/cerro-toco-0.jpg', 'Park Perimeter & Plaza', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- 4.2 St. John the Baptist Parish Cathedral
  INSERT INTO public.heritage_sites (
    slug,
    title,
    short_description,
    historical_context,
    significance,
    additional_sections,
    category,
    barangay,
    municipality,
    province,
    latitude,
    longitude,
    year_built,
    cover_image_url,
    gallery_images,
    panorama_360_url,
    is_published
  ) VALUES (
    'daet-cathedral-san-juan-bautista',
    'St. John the Baptist Parish Cathedral',
    'Historic cathedral and ecclesiastical center of Daet, originally founded by Franciscan missionaries in 1611.',
    'The parish of Daet is among the earliest founded in the province of Camarines Norte by the Franciscan Order. Although rebuilt and restored across centuries following typhoons and wartime, its spiritual and architectural legacy endures as the cathedral seat of the Diocese of Daet.',
    'A historic beacon of faith and enduring communal devotion for the Daeteño people, preserving more than four centuries of liturgical history, sacred traditions, and community heritage.',
    '[{"label": "Ecclesiastical History", "content": "Established under the Franciscan Order in 1611, the cathedral has withstood successive centuries of regional conflicts, typhoons, and liturgical restorations."}, {"label": "Sacred Traditions", "content": "Preserves more than four centuries of liturgical history, solemn fiesta processions in honor of San Juan Bautista, and religious devotion across Camarines Norte."}]'::jsonb,
    'religious',
    'Barangay IV (Poblacion)',
    'Daet',
    'Camarines Norte',
    14.1138,
    122.9547,
    '1611',
    '/images/daet-cathedral.jpg',
    ARRAY['/images/daet-cathedral.jpg'],
    'https://pannellum.org/images/cerro-toco-0.jpg',
    false -- Draft / Unpublished as requested
  )
  ON CONFLICT (slug) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_cathedral_id;

  -- Associated Panoramas for Cathedral
  IF v_cathedral_id IS NOT NULL THEN
    INSERT INTO public.heritage_panoramas (site_id, panorama_url, label, sort_order)
    VALUES
      (v_cathedral_id, 'https://pannellum.org/images/cerro-toco-0.jpg', 'Cathedral Facade & Atrium', 0),
      (v_cathedral_id, 'https://pannellum.org/images/alma.jpg', 'Interior Nave & Altar', 1)
    ON CONFLICT DO NOTHING;
  END IF;

  -- 4.3 Daet Municipal Hall & Civic Plaza
  INSERT INTO public.heritage_sites (
    slug,
    title,
    short_description,
    historical_context,
    significance,
    additional_sections,
    category,
    barangay,
    municipality,
    province,
    latitude,
    longitude,
    year_built,
    cover_image_url,
    gallery_images,
    panorama_360_url,
    is_published
  ) VALUES (
    'daet-municipal-hall-plaza',
    'Daet Municipal Hall & Civic Plaza',
    'Historic colonial civic landmark and town plaza, serving as the civic heart of Daet and the world-renowned Pineapple Festival.',
    'The historic civic hall and surrounding plaza have served as the administrative and cultural nexus of Daet since the early 20th century. It hosts the annual Pinyasan (Pineapple Festival), an internationally celebrated festival paying homage to the sweet ''Formosa'' pineapple cultivated across Daet.',
    'Represents the agricultural heritage, civic governance, cultural arts, and resilient community spirit of the capital town of Daet.',
    '[{"label": "Civic Festivities & Pinyasan", "content": "The plaza serves as the main venue for the world-renowned Pineapple Festival, celebrating Daet''s sweet Queen Formosa pineapple with street dancing and cultural exhibitions."}, {"label": "Civic Governance", "content": "Reflects the architectural transition from early colonial municipal presidencias into modern provincial governance structures."}]'::jsonb,
    'architectural',
    'Barangay Pamorangon',
    'Daet',
    'Camarines Norte',
    14.1114,
    122.9568,
    '1925',
    '/images/daet-municipal-hall.jpg',
    ARRAY['/images/daet-municipal-hall.jpg'],
    NULL,
    false -- Draft / Unpublished as requested
  )
  ON CONFLICT (slug) DO UPDATE
  SET updated_at = NOW()
  RETURNING id INTO v_plaza_id;

END $$;
