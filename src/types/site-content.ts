export interface Chapter1Highlight {
  tag: string;
  title: string;
  description: string;
}

export interface SiteContent {
  id?: string;
  logo_url: string | null;
  hero_image_url: string | null;
  hero_badge_text: string;
  hero_title: string;
  hero_description: string;
  chapter_1_title: string;
  chapter_1_body: string;
  chapter_1_highlights?: Chapter1Highlight[] | null;
  chapter_2_title: string;
  chapter_2_body: string;
  chapter_2_quote: string;
  chapter_2_quote_attribution?: string;
  chapter_2_plate_1_image: string;
  chapter_2_plate_1_title: string;
  chapter_2_plate_1_location: string;
  chapter_2_plate_1_caption: string;
  chapter_2_plate_2_image: string;
  chapter_2_plate_2_title: string;
  chapter_2_plate_2_location: string;
  chapter_2_plate_2_caption: string;
  updated_at?: string;
}
