import type { HeritageSite } from "@/types/heritage";

export const DEFAULT_HERITAGE_SITES: HeritageSite[] = [
  {
    id: "daet-site-01",
    slug: "first-rizal-monument",
    title: "First Rizal Monument",
    short_description:
      "The world's first monument erected in honor of Philippine national hero Dr. Jose Rizal, constructed in 1898 by revolutionary forces.",
    historical_context:
      "Constructed in Daet, Camarines Norte following the proclamation of the First Philippine Republic under General Emilio Aguinaldo in December 1898. Led by Lt. Col. Ildefonso Alegre and Lt. Col. Antonio Sanz, the monument was funded entirely through voluntary community contributions from the citizens and Masons of Camarines Norte.",
    significance:
      "A declared National Historical Landmark that stands as testament to the early reverence and patriotism of the Bicolano people for Dr. Jose Rizal's ideals, preceding all other monuments built in the Philippines and across the globe.",
    additional_sections: [
      {
        label: "Architecture & Design",
        content:
          "A three-tiered stone obelisk terminating in a four-sided pyramid, inscribed with Rizal's novel titles Noli Me Tangere and El Filibusterismo, and Morga's Sucesos de las Islas Filipinas.",
      },
      {
        label: "Cultural Significance",
        content:
          "A declared National Historical Landmark that stands as testament to the early reverence and patriotism of the Bicolano people for Dr. Jose Rizal's ideals, preceding all other monuments built in the Philippines and across the globe.",
      },
    ],
    category: "monument",
    barangay: "Barangay Poblacion",
    municipality: "Daet",
    province: "Camarines Norte",
    latitude: 14.1122,
    longitude: 122.9553,
    year_built: "1898",
    cover_image_url: "/images/first-rizal-monument.jpg",
    gallery_images: ["/images/first-rizal-monument.jpg"],
    panorama_360_url: "https://pannellum.org/images/alma.jpg",
    panoramas: [
      {
        id: "pano-rz-01",
        site_id: "daet-site-01",
        panorama_url: "https://pannellum.org/images/alma.jpg",
        label: "Main Monument Obelisk",
        sort_order: 0,
      },
      {
        id: "pano-rz-02",
        site_id: "daet-site-01",
        panorama_url: "https://pannellum.org/images/cerro-toco-0.jpg",
        label: "Park Perimeter & Plaza",
        sort_order: 1,
      },
    ],
    audio_guide_url: null,
    qr_code_url: null,
    is_published: true,
    created_at: "2026-09-05T00:00:00Z",
  },
  {
    id: "daet-site-02",
    slug: "daet-cathedral-san-juan-bautista",
    title: "St. John the Baptist Parish Cathedral",
    short_description:
      "Historic cathedral and ecclesiastical center of Daet, originally founded by Franciscan missionaries in 1611.",
    historical_context:
      "The parish of Daet is among the earliest founded in the province of Camarines Norte by the Franciscan Order. Although rebuilt and restored across centuries following typhoons and wartime, its spiritual and architectural legacy endures as the cathedral seat of the Diocese of Daet.",
    significance:
      "A historic beacon of faith and enduring communal devotion for the Daeteño people, preserving more than four centuries of liturgical history, sacred traditions, and community heritage.",
    additional_sections: [
      {
        label: "Ecclesiastical History",
        content:
          "Established under the Franciscan Order in 1611, the cathedral has withstood successive centuries of regional conflicts, typhoons, and liturgical restorations.",
      },
      {
        label: "Sacred Traditions",
        content:
          "Preserves more than four centuries of liturgical history, solemn fiesta processions in honor of San Juan Bautista, and religious devotion across Camarines Norte.",
      },
    ],
    category: "religious",
    barangay: "Barangay IV (Poblacion)",
    municipality: "Daet",
    province: "Camarines Norte",
    latitude: 14.1138,
    longitude: 122.9547,
    year_built: "1611",
    cover_image_url: "/images/daet-cathedral.jpg",
    gallery_images: ["/images/daet-cathedral.jpg"],
    panorama_360_url: "https://pannellum.org/images/cerro-toco-0.jpg",
    panoramas: [
      {
        id: "pano-cath-01",
        site_id: "daet-site-02",
        panorama_url: "https://pannellum.org/images/cerro-toco-0.jpg",
        label: "Cathedral Facade & Atrium",
        sort_order: 0,
      },
      {
        id: "pano-cath-02",
        site_id: "daet-site-02",
        panorama_url: "https://pannellum.org/images/alma.jpg",
        label: "Interior Nave & Altar",
        sort_order: 1,
      },
    ],
    audio_guide_url: null,
    qr_code_url: null,
    is_published: true,
    created_at: "2026-09-05T00:00:00Z",
  },
  {
    id: "daet-site-03",
    slug: "daet-municipal-hall-plaza",
    title: "Daet Municipal Hall & Civic Plaza",
    short_description:
      "Historic colonial civic landmark and town plaza, serving as the civic heart of Daet and the world-renowned Pineapple Festival.",
    historical_context:
      "The historic civic hall and surrounding plaza have served as the administrative and cultural nexus of Daet since the early 20th century. It hosts the annual Pinyasan (Pineapple Festival), an internationally celebrated festival paying homage to the sweet 'Formosa' pineapple cultivated across Daet.",
    significance:
      "Represents the agricultural heritage, civic governance, cultural arts, and resilient community spirit of the capital town of Daet.",
    additional_sections: [
      {
        label: "Civic Festivities & Pinyasan",
        content:
          "The plaza serves as the main venue for the world-renowned Pineapple Festival, celebrating Daet's sweet Queen Formosa pineapple with street dancing and cultural exhibitions.",
      },
      {
        label: "Civic Governance",
        content:
          "Reflects the architectural transition from early colonial municipal presidencias into modern provincial governance structures.",
      },
    ],
    category: "architectural",
    barangay: "Barangay Pamorangon",
    municipality: "Daet",
    province: "Camarines Norte",
    latitude: 14.1114,
    longitude: 122.9568,
    year_built: "1925",
    cover_image_url: "/images/daet-municipal-hall.jpg",
    gallery_images: ["/images/daet-municipal-hall.jpg"],
    panorama_360_url: null,
    panoramas: [],
    audio_guide_url: null,
    qr_code_url: null,
    is_published: true,
    created_at: "2026-09-05T00:00:00Z",
  },
];
