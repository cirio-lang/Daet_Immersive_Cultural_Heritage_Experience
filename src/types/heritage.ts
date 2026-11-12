export type HeritageCategory = "historical" | "monument" | "religious" | "architectural" | "cultural" | "natural";

export interface HeritagePanorama {
  id?: string;
  site_id?: string;
  panorama_url: string;
  label: string;
  sort_order: number;
  created_at?: string;
}

export interface HeritageSection {
  id?: string;
  label: string;
  content: string;
}

export interface HeritageSite {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  historical_context: string | null;
  significance: string | null;
  additional_sections?: HeritageSection[];
  category: HeritageCategory;
  barangay: string;
  municipality: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  year_built: string | null;
  cover_image_url: string | null;
  gallery_images: string[] | null;
  panorama_360_url: string | null;
  panoramas?: HeritagePanorama[];
  audio_guide_url: string | null;
  qr_code_url: string | null;
  is_published: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const CATEGORY_LABELS: Record<HeritageCategory, string> = {
  historical: "Historical Site",
  monument: "Monument",
  religious: "Religious Heritage",
  architectural: "Architectural Landmark",
  cultural: "Cultural Heritage",
  natural: "Natural Landmark",
};
