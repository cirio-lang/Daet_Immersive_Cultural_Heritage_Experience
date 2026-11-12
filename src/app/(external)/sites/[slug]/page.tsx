import { Suspense } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, Calendar, Compass, Eye, Globe, Landmark, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_HERITAGE_SITES } from "@/data/default-heritage-sites";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS, type HeritageCategory, type HeritageSite } from "@/types/heritage";

import { HeritageImage } from "../../_components/heritage-image";
import { LandingFooter } from "../../_components/landing-footer";
import { LandingNavbar } from "../../_components/landing-navbar";
import { SiteGallerySection } from "./_components/site-gallery-section";
import { SitePanoramaSection } from "./_components/site-panorama-section";
import { SiteTelemetryTracker } from "./_components/site-telemetry-tracker";
import { SiteVisitorGuide } from "./_components/site-visitor-guide";

interface SitePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HeritageSiteDetailPage({ params }: SitePageProps) {
  const { slug } = await params;

  let site: HeritageSite | null = null;
  let logoUrl: string | null = null;

  try {
    const supabase = await createClient();
    const [siteRes, contentRes] = await Promise.all([
      supabase
        .from("heritage_sites")
        .select("*, heritage_panoramas(id, panorama_url, label, sort_order, created_at)")
        .eq("slug", slug)
        .eq("is_published", true)
        .single(),
      supabase.from("site_content").select("logo_url").eq("id", "landing_page").single(),
    ]);

    if (contentRes.data?.logo_url) {
      logoUrl = contentRes.data.logo_url;
    }

    if (siteRes.data) {
      site = {
        ...siteRes.data,
        panoramas: Array.isArray(siteRes.data.heritage_panoramas)
          ? (siteRes.data.heritage_panoramas as Record<string, unknown>[]).sort(
              (a: Record<string, unknown>, b: Record<string, unknown>) =>
                ((a.sort_order as number) ?? 0) - ((b.sort_order as number) ?? 0),
            )
          : [],
        heritage_panoramas: undefined,
      } as HeritageSite;
    }
  } catch {
    // Continue to fallback
  }

  // Fallback to local default sites if not found in database
  if (!site) {
    const fallback = DEFAULT_HERITAGE_SITES.find((s) => s.slug === slug);
    if (fallback) {
      site = fallback;
    }
  }

  if (!site) {
    notFound();
  }

  const categoryLabel = CATEGORY_LABELS[site.category as HeritageCategory] || site.category;
  const coverImage =
    site.cover_image_url ||
    "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-700 overflow-x-hidden">
      <LandingNavbar logoUrl={logoUrl} />

      <main className="flex-1 pb-24">
        <Suspense fallback={null}>
          <SiteTelemetryTracker siteId={site.id} />
        </Suspense>
        {/* Back Link & Museum Breadcrumb */}
        <div className="border-b border-[#c5a059]/20 bg-muted/20">
          <div className="container mx-auto flex max-w-6xl items-center px-4 py-3.5 sm:px-6 lg:px-8">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:bg-transparent hover:text-[#c5a059]"
            >
              <Link href="/#directory">
                <ArrowLeft className="size-3.5" strokeWidth={1.25} />
                <span>Return to Catalogue</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Banner with Cinematic Vignette & Serif Typography */}
        <div className="relative h-88 sm:h-[30rem] w-full overflow-hidden bg-black">
          <HeritageImage
            src={site.cover_image_url}
            alt={site.title}
            category={site.category as HeritageCategory}
            className="h-full w-full object-cover brightness-[0.5] contrast-[1.1] filter"
          />
          {/* Deep museum vignette gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/60 pointer-events-none" />

          <div className="absolute inset-x-0 bottom-0">
            <div className="container mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-none border border-[#c5a059]/60 bg-[#080d17]/90 px-3 py-1 font-mono text-[10px] font-medium tracking-[0.25em] text-[#e5c98b] uppercase backdrop-blur-md shadow-xs">
                  {categoryLabel}
                </span>
                {site.year_built && (
                  <span className="flex items-center gap-1.5 rounded-none border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-wider text-[#e8d5b5] backdrop-blur-md shadow-xs">
                    <Calendar className="size-3 text-[#c5a059]" strokeWidth={1.5} />
                    <span>Circa {site.year_built}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-none border border-white/20 bg-black/60 px-3 py-1 font-mono text-[10px] tracking-wider text-[#e8d5b5] backdrop-blur-md shadow-xs">
                  <MapPin className="size-3 text-[#c5a059]" strokeWidth={1.5} />
                  <span>
                    {site.barangay}, {site.municipality}, {site.province}
                  </span>
                </span>
              </div>

              <h1 className="font-serif text-3xl font-normal tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl leading-[1.15]">
                {site.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Exhibition Layout */}
        <div className="container mx-auto max-w-6xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column: Historical Context & 360 View */}
            <div className="space-y-10 lg:col-span-2">
              {/* Short Summary Card (Overview) */}
              {site.short_description && (
                <div className="border-l-2 border-[#c5a059] bg-muted/20 p-6 shadow-xs">
                  <h2 className="mb-2 font-mono text-[10px] font-medium tracking-[0.25em] text-[#c5a059] uppercase">
                    Overview
                  </h2>
                  <p className="font-serif text-base font-normal leading-relaxed text-foreground sm:text-lg">
                    {site.short_description}
                  </p>
                </div>
              )}

              {/* 360 Panorama Viewer Section with Multiple Perspectives */}
              <SitePanoramaSection
                panoramas={site.panoramas}
                fallbackPanoramaUrl={site.panorama_360_url}
                siteTitle={site.title}
              />

              {/* Archival Photographic Gallery Plates */}
              {site.gallery_images && site.gallery_images.length > 0 && (
                <SiteGallerySection images={site.gallery_images} siteTitle={site.title} />
              )}

              {/* History */}
              {site.historical_context && (
                <div className="border border-[#c5a059]/20 bg-card p-8 shadow-xs">
                  <div className="mb-4 flex items-center gap-3 border-b border-[#c5a059]/15 pb-4">
                    <Landmark className="size-5 text-[#c5a059]" strokeWidth={1.25} />
                    <h2 className="font-serif text-2xl font-normal text-foreground">History</h2>
                  </div>
                  <div className="prose prose-neutral dark:prose-invert max-w-none font-sans text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                    <p className="whitespace-pre-line">{site.historical_context}</p>
                  </div>
                </div>
              )}

              {/* Flexible Additional Details & Custom Sections */}
              {site.additional_sections && site.additional_sections.length > 0 ? (
                site.additional_sections.map((section, sIdx) => (
                  <div key={sIdx} className="border border-[#c5a059]/20 bg-card p-8 shadow-xs">
                    <div className="mb-4 flex items-center gap-3 border-b border-[#c5a059]/15 pb-4">
                      <Globe className="size-5 text-[#c5a059]" strokeWidth={1.25} />
                      <h2 className="font-serif text-2xl font-normal text-foreground">{section.label}</h2>
                    </div>
                    <div className="prose prose-neutral dark:prose-invert max-w-none font-sans text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                      <p className="whitespace-pre-line">{section.content}</p>
                    </div>
                  </div>
                ))
              ) : site.significance ? (
                <div className="border border-[#c5a059]/20 bg-card p-8 shadow-xs">
                  <div className="mb-4 flex items-center gap-3 border-b border-[#c5a059]/15 pb-4">
                    <Globe className="size-5 text-[#c5a059]" strokeWidth={1.25} />
                    <h2 className="font-serif text-2xl font-normal text-foreground">
                      Cultural &amp; Communal Significance
                    </h2>
                  </div>
                  <div className="prose prose-neutral dark:prose-invert max-w-none font-sans text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                    <p className="whitespace-pre-line">{site.significance}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right Column: Visitor Guide & Site Meta Plaque */}
            <div className="space-y-8">
              {/* Tourist / Visitor Quick Field Guide & Actions */}
              <SiteVisitorGuide
                slug={site.slug}
                title={site.title}
                barangay={site.barangay}
                category={CATEGORY_LABELS[site.category as HeritageCategory] || site.category}
                municipality={site.municipality}
                province={site.province}
                latitude={site.latitude}
                longitude={site.longitude}
                logoUrl={logoUrl}
                hasGallery={Boolean(site.gallery_images && site.gallery_images.length > 0)}
                galleryCount={site.gallery_images?.length ?? 0}
              />

              {/* Geographic & Meta Card */}
              <Card className="rounded-none border border-[#c5a059]/25 bg-card">
                <CardHeader className="border-b border-[#c5a059]/15 pb-3">
                  <CardTitle className="font-serif text-base font-normal text-foreground">
                    Archival Gazetteer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-xs font-light">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Municipality</span>
                    <span className="font-medium text-foreground">{site.municipality}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Barangay</span>
                    <span className="font-medium text-foreground">{site.barangay}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Province</span>
                    <span className="font-medium text-foreground">{site.province}</span>
                  </div>
                  {site.latitude && site.longitude && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground">GPS Coordinates</span>
                      <span className="font-mono text-[#c5a059]">
                        {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter logoUrl={logoUrl} />
    </div>
  );
}
