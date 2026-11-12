import { DEFAULT_HERITAGE_SITES } from "@/data/default-heritage-sites";
import { DEFAULT_SITE_CONTENT } from "@/data/default-site-content";
import { createClient } from "@/lib/supabase/server";
import type { HeritageSite } from "@/types/heritage";
import type { SiteContent } from "@/types/site-content";

import { ArchivalShowcase } from "./_components/archival-showcase";
import { ExhibitionOverview } from "./_components/exhibition-overview";
import { HeritageDirectory } from "./_components/heritage-directory";
import { HeroSection } from "./_components/hero-section";
import { LandingFooter } from "./_components/landing-footer";
import { LandingNavbar } from "./_components/landing-navbar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let sites: HeritageSite[] = [];
  let isUsingFallback = false;
  let siteContent: SiteContent = DEFAULT_SITE_CONTENT;

  try {
    const supabase = await createClient();

    // Parallel fetch for heritage sites and landing page site_content
    const [sitesRes, contentRes] = await Promise.all([
      supabase.from("heritage_sites").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      supabase.from("site_content").select("*").eq("id", "landing_page").single(),
    ]);

    if (sitesRes.error) {
      console.warn("Supabase query warning:", sitesRes.error.message);
      sites = DEFAULT_HERITAGE_SITES;
      isUsingFallback = true;
    } else if (sitesRes.data && sitesRes.data.length > 0) {
      sites = sitesRes.data as HeritageSite[];
      isUsingFallback = false;
    } else {
      // If table is currently empty, show the 3 curated initial Daet sites
      sites = DEFAULT_HERITAGE_SITES;
      isUsingFallback = true;
    }

    if (contentRes.data) {
      siteContent = {
        ...DEFAULT_SITE_CONTENT,
        ...contentRes.data,
      };
    }
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    sites = DEFAULT_HERITAGE_SITES;
    isUsingFallback = true;
    siteContent = DEFAULT_SITE_CONTENT;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNavbar logoUrl={siteContent.logo_url} />
      <main className="flex-1">
        {/* Cinematic Hero Section with Museum Crest */}
        <HeroSection content={siteContent} />

        {/* Section 1: Dark Navy Curatorial Overview (Chapter I) */}
        <ExhibitionOverview content={siteContent} />

        {/* Section 2: Warm Cream/Parchment Visual Showcase (Chapter II) */}
        <ArchivalShowcase content={siteContent} />

        {/* Section 3: Permanent Heritage Directory Catalog */}
        <HeritageDirectory sites={sites} isUsingFallback={isUsingFallback} />
      </main>
      <LandingFooter logoUrl={siteContent.logo_url} />
    </div>
  );
}
