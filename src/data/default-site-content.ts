import type { Chapter1Highlight, SiteContent } from "@/types/site-content";

export const DEFAULT_CHAPTER_1_HIGHLIGHTS: Chapter1Highlight[] = [
  {
    tag: "Historical Landmark",
    title: "The Masonry of Liberty: Unang Bantayog (1898)",
    description:
      "Erected on December 30, 1898 by the Republican forces under Lt. Col. Ildefonso Alegre and Antonio Sanz, this three-tiered stone obelisk preceded all other Rizal monuments across the globe. Built entirely through voluntary civic contributions, it stands as an enduring emblem of Bicolano revolutionary idealism.",
  },
  {
    tag: "Sacred Tradition",
    title: "Franciscan Foundations: San Juan Bautista (1611)",
    description:
      "Established in 1611 by Franciscan missionaries, the Cathedral of San Juan Bautista has weathered over four centuries of maritime typhoons, colonial shifts, and regional conflicts. It serves as both the seat of the Diocese of Daet and the spiritual sanctuary of the Daeteño community.",
  },
  {
    tag: "Civic & Communal",
    title: "Colonial Civic Order & The Pineapple Festival",
    description:
      "From the American colonial era municipal hall to the expansive public plaza, Daet's urban center bridges governance and communal revelry. Every year, the plaza hosts the Pinyasan Festival, celebrating the indigenous agricultural heritage and sweet Formosa harvest of Camarines Norte.",
  },
  {
    tag: "Digital Archiving",
    title: "360° Photogrammetry & Field Telemetry",
    description:
      "Bridging antiquity with modern technology, each landmark is equipped with high-resolution 360° virtual tours and on-site physical QR markers, enabling students, scholars, and pilgrims to experience immersive exhibition spaces from anywhere in the world.",
  },
];

export const DEFAULT_SITE_CONTENT: SiteContent = {
  logo_url: null,
  hero_image_url: null,
  hero_badge_text: "Municipality of Daet • Est. 1583",
  hero_title: "Daet Immersive Cultural Heritage Experience",
  hero_description:
    "A permanent digital exhibition dedicated to preserving the sacred monuments, revolutionary memories, and colonial architecture of the capital town of Camarines Norte through 360° virtual tours.",
  chapter_1_title: "A Confluence of Revolutionary Valor & Sacred Foundations",
  chapter_1_body:
    "Long before modern monuments were erected across the archipelago, the town of Daet stood as a cradle of civic and spiritual identity in the Bicol region. Here, revolutionary leaders and local citizens united in 1898 to construct the world's first memorial to Dr. Jose Rizal, while four centuries of Franciscan stewardship anchored faith and architecture along the Daet Riverbank.",
  chapter_1_highlights: DEFAULT_CHAPTER_1_HIGHLIGHTS,
  chapter_2_title: "Echoes in Stone, Wood & Memory",
  chapter_2_body:
    "Every obelisk, altar, and colonial facade across Daet preserves an indelible layer of Philippine consciousness. From the hand-hewn river stones embedded in the First Rizal Monument to the Spanish-era ecclesiastical timbers of the Cathedral, these physical artifacts survive as tangible witnesses to four centuries of courage and community devotion.",
  chapter_2_quote:
    "A nation that remembers its monuments in times of peace honors the blood and sacrifice that carved its foundations.",
  chapter_2_quote_attribution: "— Historical Inscription, Daet Revolutionary Annals",
  chapter_2_plate_1_image: "/images/first-rizal-monument.jpg",
  chapter_2_plate_1_title: "First Rizal Monument",
  chapter_2_plate_1_location: "Barangay Poblacion, Daet",
  chapter_2_plate_1_caption:
    "Constructed by revolutionary forces during the Philippine-American interregnum. Declared National Historical Landmark.",
  chapter_2_plate_2_image: "/images/daet-cathedral.jpg",
  chapter_2_plate_2_title: "Cathedral of San Juan Bautista",
  chapter_2_plate_2_location: "Diocese of Daet",
  chapter_2_plate_2_caption:
    "Four centuries of Franciscan ministry, architectural preservation, and sacred Bicolano traditions.",
};
