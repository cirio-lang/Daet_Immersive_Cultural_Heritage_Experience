"use client";

import * as React from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  ImageIcon,
  Landmark,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CHAPTER_1_HIGHLIGHTS, DEFAULT_SITE_CONTENT } from "@/data/default-site-content";
import { convertHeicToJpeg, isHeicFile } from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import type { Chapter1Highlight, SiteContent } from "@/types/site-content";

import { updateSiteContent } from "../actions";

interface SiteContentFormProps {
  initialContent: SiteContent;
}

export function SiteContentForm({ initialContent }: SiteContentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<SiteContent>(initialContent);
  const [isSaving, setIsSaving] = React.useState(false);

  // Uploading states
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
  const [isUploadingHero, setIsUploadingHero] = React.useState(false);
  const [isUploadingPlate1, setIsUploadingPlate1] = React.useState(false);
  const [isUploadingPlate2, setIsUploadingPlate2] = React.useState(false);

  const handleChange = (field: keyof SiteContent, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const highlights: Chapter1Highlight[] =
    formData.chapter_1_highlights && formData.chapter_1_highlights.length === 4
      ? formData.chapter_1_highlights
      : DEFAULT_CHAPTER_1_HIGHLIGHTS;

  const handleHighlightChange = (index: number, field: keyof Chapter1Highlight, value: string) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, chapter_1_highlights: updated }));
  };

  const handleResetHighlights = () => {
    setFormData((prev) => ({ ...prev, chapter_1_highlights: DEFAULT_CHAPTER_1_HIGHLIGHTS }));
    toast.info("Restored 4 curated exhibition pillars. Click 'Save Site Content' to apply.");
  };

  // Upload helper for site-content images
  const uploadImage = async (file: File, prefix: "logo" | "hero" | "plate1" | "plate2"): Promise<string> => {
    let fileToUpload = file;
    if (isHeicFile(file)) {
      toast.info("Converting Apple HEIC photo to JPEG for web compatibility...");
      fileToUpload = await convertHeicToJpeg(file);
    }
    const supabase = createClient();
    const fileExt = fileToUpload.name.split(".").pop() || "jpg";
    const fileName = `site-content/${prefix}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("heritage-media").upload(fileName, fileToUpload, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("heritage-media").getPublicUrl(fileName);

    return publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      toast.info("Uploading site logo / emblem...");
      const url = await uploadImage(file, "logo");
      handleChange("logo_url", url);
      toast.success("Site logo uploaded!");
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("daet_heritage_sync");
        bc.postMessage({ type: "LOGO_UPDATED", logoUrl: url });
        bc.close();
      }
    } catch (err: unknown) {
      console.error("Failed to upload logo:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingHero(true);
      toast.info("Uploading hero background photo...");
      const url = await uploadImage(file, "hero");
      handleChange("hero_image_url", url);
      toast.success("Hero background photo uploaded!");
    } catch (err: unknown) {
      console.error("Failed to upload hero image:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploadingHero(false);
      e.target.value = "";
    }
  };

  const handlePlate1Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPlate1(true);
      toast.info("Uploading Plate I photo...");
      const url = await uploadImage(file, "plate1");
      handleChange("chapter_2_plate_1_image", url);
      toast.success("Plate I photo uploaded!");
    } catch (err: unknown) {
      console.error("Failed to upload Plate I image:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploadingPlate1(false);
      e.target.value = "";
    }
  };

  const handlePlate2Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPlate2(true);
      toast.info("Uploading Plate II photo...");
      const url = await uploadImage(file, "plate2");
      handleChange("chapter_2_plate_2_image", url);
      toast.success("Plate II photo uploaded!");
    } catch (err: unknown) {
      console.error("Failed to upload Plate II image:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploadingPlate2(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateSiteContent(formData);
      if (!res.success) {
        throw new Error(res.error || "Failed to save site content");
      }
      toast.success("Site content saved successfully! Live homepage updated.");

      if (res.warning) {
        toast.warning(res.warning, { duration: 10000 });
      }

      // Broadcast update across open tabs for zero-delay synchronization
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        const bc = new BroadcastChannel("daet_heritage_sync");
        bc.postMessage({ type: "CONTENT_UPDATED", logoUrl: formData.logo_url });
        bc.postMessage({ type: "LOGO_UPDATED", logoUrl: formData.logo_url });
        bc.close();
      }

      router.refresh();
    } catch (err: unknown) {
      console.error("Error saving site content:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save site content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (
      window.confirm(
        "Are you sure you want to restore default curatorial texts and sample images? Any unsaved changes will be lost.",
      )
    ) {
      setFormData(DEFAULT_SITE_CONTENT);
      toast.info("Restored default curatorial texts. Click 'Save Changes' to apply.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#c5a059]">
            <LayoutTemplate className="size-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">Curation &amp; Exhibits</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl mt-1">
            Site Content Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Control the visual presentation and curatorial texts of the public landing page without touching code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            asChild
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-[#c5a059]/40 text-xs font-medium hover:border-[#c5a059]"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              <span>Preview Live Site</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetToDefaults}
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>Restore Defaults</span>
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-9 gap-2 bg-[#c5a059] px-4 text-xs font-semibold text-black hover:bg-[#b08e48]"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                <span>Save Site Content</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1">
          <TabsTrigger value="branding" className="text-xs data-[state=active]:bg-background">
            Brand Logo &amp; Crest
          </TabsTrigger>
          <TabsTrigger value="hero" className="text-xs data-[state=active]:bg-background">
            Hero &amp; Entrance
          </TabsTrigger>
          <TabsTrigger value="chapter-1" className="text-xs data-[state=active]:bg-background">
            Chapter I: Introduction
          </TabsTrigger>
          <TabsTrigger value="chapter-2" className="text-xs data-[state=active]:bg-background">
            Chapter II: Archival Plates
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------------------------------------- */}
        {/* TAB 0: BRAND LOGO & CREST (DYNAMIC LANDMARK REPLACEMENT)     */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="branding" className="mt-4 space-y-6">
          <Card className="border-[#c5a059]/30">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Brand Logo &amp; Building Icon Replacement</CardTitle>
                  <CardDescription className="text-xs">
                    Upload a custom municipal emblem, official seal, or institution logo to dynamically replace the
                    hardcoded Landmark building icon.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#c5a059]/40 text-[#c5a059] text-[10px]">
                  Global Logo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Logo Upload & Controls */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Custom Logo / Seal</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Accepts PNG, JPG, SVG, or WebP. Transparent backgrounds (PNG/SVG) look best.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.logo_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => handleChange("logo_url", null)}
                        className="h-8 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <X className="size-3 mr-1" />
                        Reset to Default Building Icon
                      </Button>
                    )}
                    <Label
                      htmlFor="logo-upload-input"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#c5a059] px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#b08e48] transition-colors shadow-xs"
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-3.5" />
                          <span>Upload Logo File</span>
                        </>
                      )}
                    </Label>
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp,image/heic,image/heif,.heic,.heif"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="logo_url" className="text-xs font-semibold">
                    Direct Image URL (Optional Alternative)
                  </Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url || ""}
                    onChange={(e) => handleChange("logo_url", e.target.value.trim() || null)}
                    placeholder="https://... or uploaded file URL (leave blank for default Landmark building icon)"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Live Previews */}
              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-[#c5a059]" />
                  <span className="text-xs font-semibold tracking-wider text-[#c5a059] uppercase">
                    Live Placements &amp; Previews
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The design and proportions remain 100% intact. Below is how your logo appears dynamically across all
                  building icon placements:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Preview 1: Admin Sidebar Header */}
                  <div className="flex flex-col gap-2 rounded-md border border-border/80 bg-card p-3.5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      1. Admin Sidebar Header
                    </span>
                    <div className="flex items-center gap-2.5 rounded-md border border-border/60 bg-muted/40 p-2.5">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Sidebar Logo Preview"
                          className="size-4 shrink-0 rounded-xs object-contain"
                        />
                      ) : (
                        <Landmark className="size-4 shrink-0 text-foreground" />
                      )}
                      <span className="font-semibold text-sm truncate">Daet Cultural Heritage</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Links to Heritage Sites. Size: 16×16px (size-4).
                    </span>
                  </div>

                  {/* Preview 2: Public Navigation Bar */}
                  <div className="flex flex-col gap-2 rounded-md border border-border/80 bg-[#080d17] p-3.5 text-white shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#c5a059]">2. Public Navbar Crest</span>
                    <div className="flex items-center gap-2.5 rounded-md border border-[#c5a059]/30 bg-[#0c121e]/80 p-2">
                      <div className="flex size-9 items-center justify-center rounded-full border border-[#c5a059]/40 bg-[#0c121e] text-[#c5a059] overflow-hidden p-1.5 shrink-0">
                        {formData.logo_url ? (
                          <img src={formData.logo_url} alt="Navbar Logo Preview" className="size-full object-contain" />
                        ) : (
                          <Landmark className="size-4" strokeWidth={1.25} />
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-semibold tracking-wider text-[#faf7f2] truncate">
                          DAET HERITAGE
                        </span>
                        <span className="text-[8px] tracking-widest text-[#c5a059]">MUSEUM &amp; ARCHIVES</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#a89d8d]">In circular crest with gold border.</span>
                  </div>

                  {/* Preview 3: Hero Section Grand Seal */}
                  <div className="flex flex-col gap-2 rounded-md border border-border/80 bg-[#080d17] p-3.5 text-white shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#c5a059]">3. Hero Grand Seal</span>
                    <div className="flex items-center gap-3 rounded-md border border-[#c5a059]/30 bg-[#0c121e]/80 p-2">
                      <div className="flex size-11 items-center justify-center rounded-full border border-[#c5a059]/50 bg-[#080d17]/80 shadow-md overflow-hidden p-2 shrink-0">
                        {formData.logo_url ? (
                          <img src={formData.logo_url} alt="Hero Seal Preview" className="size-full object-contain" />
                        ) : (
                          <Landmark className="size-5 text-[#c5a059]" strokeWidth={1.25} />
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-[9px] tracking-widest text-[#c5a059] truncate uppercase">
                          {formData.hero_badge_text || "DAET HERITAGE"}
                        </span>
                        <span className="text-[11px] text-[#faf7f2] truncate">Cinematic Exhibition Crest</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#a89d8d]">Top centerpiece of the landing experience.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: HERO & ENTRANCE                                        */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="hero" className="mt-4 space-y-6">
          <Card className="border-[#c5a059]/30">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Hero Showcase Banner</CardTitle>
                  <CardDescription className="text-xs">
                    The top full-bleed entrance screen welcoming visitors to the Daet cultural exhibition.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#c5a059]/40 text-[#c5a059] text-[10px]">
                  Full-Bleed Header
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Hero Image Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">Hero Background Photo</Label>
                  {formData.hero_image_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleChange("hero_image_url", null)}
                      className="h-6 text-[11px] text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-3 mr-1" />
                      Reset to Default Background
                    </Button>
                  )}
                </div>

                <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg border border-border/80 bg-black/50">
                  <img
                    src={formData.hero_image_url || "/images/hero-bg.jpg"}
                    alt="Hero Background Preview"
                    className="h-full w-full object-cover brightness-[0.6] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Overlay badge preview */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <span className="rounded border border-[#c5a059]/60 bg-black/70 px-2.5 py-0.5 text-[10px] tracking-widest text-[#e5c98b] uppercase backdrop-blur-xs font-medium">
                        {formData.hero_badge_text || "Badge Preview"}
                      </span>
                      <p className="text-sm font-medium mt-1 truncate max-w-md">
                        {formData.hero_title || "Title Preview"}
                      </p>
                    </div>

                    <Label
                      htmlFor="hero-upload-input"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#c5a059] px-3.5 py-2 text-xs font-semibold text-black hover:bg-[#b08e48] transition-colors shadow-lg"
                    >
                      {isUploadingHero ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-3.5" />
                          <span>Change Photo</span>
                        </>
                      )}
                    </Label>
                    <input
                      id="hero-upload-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      className="hidden"
                      onChange={handleHeroUpload}
                      disabled={isUploadingHero}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Recommended: High-resolution landscape photo (1920×1080 or 2560×1440). If blank, the system displays
                  the default colonial plaza obelisk image.
                </p>
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero_badge_text" className="text-xs font-semibold">
                    Museum Crest Sub-Badge
                  </Label>
                  <Input
                    id="hero_badge_text"
                    value={formData.hero_badge_text}
                    onChange={(e) => handleChange("hero_badge_text", e.target.value)}
                    placeholder="e.g. Municipality of Daet • Est. 1583"
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Appears with the museum seal emblem above the main title.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_title" className="text-xs font-semibold">
                    Main Headline Title
                  </Label>
                  <Input
                    id="hero_title"
                    value={formData.hero_title}
                    onChange={(e) => handleChange("hero_title", e.target.value)}
                    placeholder="Daet Immersive Cultural Heritage Experience"
                    className="h-9 text-xs"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Primary exhibition title displayed on the landing page.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_description" className="text-xs font-semibold">
                  Curatorial Subtitle &amp; Description
                </Label>
                <Textarea
                  id="hero_description"
                  value={formData.hero_description}
                  onChange={(e) => handleChange("hero_description", e.target.value)}
                  rows={3}
                  className="text-xs leading-relaxed"
                  placeholder="A permanent digital exhibition dedicated to..."
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  The welcoming paragraph positioned below the headline on the home screen.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: CHAPTER I (CURATORIAL OVERVIEW)                         */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="chapter-1" className="mt-4 space-y-6">
          <Card className="border-[#c5a059]/30">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Chapter I: Curatorial Introduction</CardTitle>
                  <CardDescription className="text-xs">
                    The dark navy section introducing the historical confluence of Daet&apos;s heritage.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#c5a059]/40 text-[#c5a059] text-[10px]">
                  Section 1 • Dark Navy
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="chapter_1_title" className="text-xs font-semibold">
                  Chapter I Heading
                </Label>
                <Input
                  id="chapter_1_title"
                  value={formData.chapter_1_title}
                  onChange={(e) => handleChange("chapter_1_title", e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter_1_body" className="text-xs font-semibold">
                  Chapter I Curatorial Narrative Body
                </Label>
                <Textarea
                  id="chapter_1_body"
                  value={formData.chapter_1_body}
                  onChange={(e) => handleChange("chapter_1_body", e.target.value)}
                  rows={6}
                  className="text-xs leading-relaxed"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Summarizes the four centuries of Daet&apos;s history connecting the 1898 First Rizal Monument to the
                  1611 Franciscan parish.
                </p>
              </div>

              {/* Thematic Exhibition Highlights (The 4 Pillars) */}
              <div className="border-t border-border/80 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Thematic Exhibition Highlights (The 4 Pillars)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The four curated thematic focal points displayed directly beneath Chapter I on the public website.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleResetHighlights}
                    className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <RotateCcw className="size-3" />
                    <span>Reset Pillars to Defaults</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {highlights.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-3.5 transition-colors hover:border-[#c5a059]/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-[#c5a059] font-semibold">
                          Pillar {idx + 1}
                        </span>
                        <Badge variant="outline" className="border-border/80 text-[9px]">
                          {idx === 0
                            ? "Historical Landmark"
                            : idx === 1
                              ? "Sacred Tradition"
                              : idx === 2
                                ? "Civic & Communal"
                                : "Digital Archiving"}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Category Badge Label</Label>
                        <Input
                          value={pillar.tag}
                          onChange={(e) => handleHighlightChange(idx, "tag", e.target.value)}
                          placeholder="e.g. Historical Landmark"
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Pillar Heading</Label>
                        <Input
                          value={pillar.title}
                          onChange={(e) => handleHighlightChange(idx, "title", e.target.value)}
                          placeholder="e.g. The Masonry of Liberty: Unang Bantayog (1898)"
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold text-muted-foreground">Narrative Content</Label>
                        <Textarea
                          value={pillar.description}
                          onChange={(e) => handleHighlightChange(idx, "description", e.target.value)}
                          rows={4}
                          placeholder="Narrative description for this pillar..."
                          className="text-xs leading-relaxed"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: CHAPTER II (ARCHIVAL SHOWCASE & PLATES)                 */}
        {/* ------------------------------------------------------------- */}
        <TabsContent value="chapter-2" className="mt-4 space-y-6">
          <Card className="border-[#c5a059]/30">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Chapter II: Archival Showcase</CardTitle>
                  <CardDescription className="text-xs">
                    The parchment exhibition section featuring curatorial essay, historic quote, and dual exhibition
                    plates.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-[#c5a059]/40 text-[#c5a059] text-[10px]">
                  Section 2 • Parchment
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Heading & Body */}
              <div className="space-y-2">
                <Label htmlFor="chapter_2_title" className="text-xs font-semibold">
                  Chapter II Heading
                </Label>
                <Input
                  id="chapter_2_title"
                  value={formData.chapter_2_title}
                  onChange={(e) => handleChange("chapter_2_title", e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter_2_body" className="text-xs font-semibold">
                  Curatorial Essay Narrative
                </Label>
                <Textarea
                  id="chapter_2_body"
                  value={formData.chapter_2_body}
                  onChange={(e) => handleChange("chapter_2_body", e.target.value)}
                  rows={4}
                  className="text-xs leading-relaxed"
                  required
                />
              </div>

              {/* Historical Quotation & Inscription Source */}
              <div className="rounded-lg border border-border/70 bg-muted/15 p-4 space-y-3">
                <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-wider">
                  Featured Epigraph & Historical Inscription
                </span>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="chapter_2_quote" className="text-[11px] font-semibold">
                      Quotation Text
                    </Label>
                    <Input
                      id="chapter_2_quote"
                      value={formData.chapter_2_quote}
                      onChange={(e) => handleChange("chapter_2_quote", e.target.value)}
                      placeholder="e.g., A nation that remembers its monuments..."
                      className="h-9 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="chapter_2_quote_attribution" className="text-[11px] font-semibold">
                      Attribution / Source Inscription
                    </Label>
                    <Input
                      id="chapter_2_quote_attribution"
                      value={
                        formData.chapter_2_quote_attribution ?? "— Historical Inscription, Daet Revolutionary Annals"
                      }
                      onChange={(e) => handleChange("chapter_2_quote_attribution", e.target.value)}
                      placeholder="e.g., — Historical Inscription, Daet Revolutionary Annals"
                      className="h-9 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Exhibition Plates 1 & 2 */}
              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Visual Exhibition Plates (Right Column Spread)
                </h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Plate 1 */}
                  <div className="rounded-lg border border-border/80 p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-wider">
                        Plate I • Archival Feature
                      </span>
                      <Label
                        htmlFor="plate1-upload"
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-[#c5a059] hover:underline"
                      >
                        {isUploadingPlate1 ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <UploadCloud className="size-3" />
                        )}
                        <span>Upload Photo</span>
                      </Label>
                      <input
                        id="plate1-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        className="hidden"
                        onChange={handlePlate1Upload}
                        disabled={isUploadingPlate1}
                      />
                    </div>

                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-black">
                      <img
                        src={formData.chapter_2_plate_1_image || "/images/first-rizal-monument.jpg"}
                        alt="Plate I Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 text-white pointer-events-none">
                        <p className="text-xs font-medium truncate">
                          {formData.chapter_2_plate_1_title || "First Rizal Monument"}
                        </p>
                        <p className="text-[10px] text-[#e8d5b5] font-light truncate">
                          {formData.chapter_2_plate_1_location || "Barangay Poblacion, Daet"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="plate1_title" className="text-[11px] font-semibold">
                          Plate I Landmark / Title
                        </Label>
                        <Input
                          id="plate1_title"
                          value={formData.chapter_2_plate_1_title || ""}
                          onChange={(e) => handleChange("chapter_2_plate_1_title", e.target.value)}
                          placeholder="e.g., First Rizal Monument"
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="plate1_location" className="text-[11px] font-semibold">
                          Plate I Location / Subtitle
                        </Label>
                        <Input
                          id="plate1_location"
                          value={formData.chapter_2_plate_1_location || ""}
                          onChange={(e) => handleChange("chapter_2_plate_1_location", e.target.value)}
                          placeholder="e.g., Barangay Poblacion, Daet"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="plate1_caption" className="text-[11px] font-semibold">
                        Plate I Caption & Historical Note
                      </Label>
                      <Textarea
                        id="plate1_caption"
                        value={formData.chapter_2_plate_1_caption}
                        onChange={(e) => handleChange("chapter_2_plate_1_caption", e.target.value)}
                        rows={3}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Plate 2 */}
                  <div className="rounded-lg border border-border/80 p-4 space-y-3 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#c5a059] uppercase tracking-wider">
                        Plate II • Archival Feature
                      </span>
                      <Label
                        htmlFor="plate2-upload"
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-[#c5a059] hover:underline"
                      >
                        {isUploadingPlate2 ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <UploadCloud className="size-3" />
                        )}
                        <span>Upload Photo</span>
                      </Label>
                      <input
                        id="plate2-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        className="hidden"
                        onChange={handlePlate2Upload}
                        disabled={isUploadingPlate2}
                      />
                    </div>

                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-black">
                      <img
                        src={formData.chapter_2_plate_2_image || "/images/daet-cathedral.jpg"}
                        alt="Plate II Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 text-white pointer-events-none">
                        <p className="text-xs font-medium truncate">
                          {formData.chapter_2_plate_2_title || "Cathedral of San Juan Bautista"}
                        </p>
                        <p className="text-[10px] text-[#e8d5b5] font-light truncate">
                          {formData.chapter_2_plate_2_location || "Diocese of Daet"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="plate2_title" className="text-[11px] font-semibold">
                          Plate II Landmark / Title
                        </Label>
                        <Input
                          id="plate2_title"
                          value={formData.chapter_2_plate_2_title || ""}
                          onChange={(e) => handleChange("chapter_2_plate_2_title", e.target.value)}
                          placeholder="e.g., Cathedral of San Juan Bautista"
                          className="h-8 text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="plate2_location" className="text-[11px] font-semibold">
                          Plate II Location / Subtitle
                        </Label>
                        <Input
                          id="plate2_location"
                          value={formData.chapter_2_plate_2_location || ""}
                          onChange={(e) => handleChange("chapter_2_plate_2_location", e.target.value)}
                          placeholder="e.g., Diocese of Daet"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="plate2_caption" className="text-[11px] font-semibold">
                        Plate II Caption & Historical Note
                      </Label>
                      <Textarea
                        id="plate2_caption"
                        value={formData.chapter_2_plate_2_caption}
                        onChange={(e) => handleChange("chapter_2_plate_2_caption", e.target.value)}
                        rows={3}
                        className="text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
